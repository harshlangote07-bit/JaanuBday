
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type Env = {
  BIRTHDAY_PASSCODE?: string;
  SESSION_SECRET?: string;
};

type ServerEntry = {
  fetch: (request: Request) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const COOKIE_NAME = "jaanu_bday_access";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

function htmlResponse(
  html: string,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function loginPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#100e0d">
<title>A little universe</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;
background:radial-gradient(ellipse at 50% 35%,#39291d,#191310 42%,#0c0b0b 80%);
color:#f5eee5;font-family:Georgia,'Times New Roman',serif}
main{width:min(100%,410px);text-align:center;padding:44px 28px;
border:1px solid #c7a36b42;background:#100e0dc9;
box-shadow:0 25px 100px #0008}
.mark{color:#d9b779;font-size:30px;margin-bottom:26px}
.eyebrow{font:10px Arial,sans-serif;letter-spacing:.28em;
text-transform:uppercase;color:#c7b9a5}
h1{font-size:clamp(32px,8vw,45px);font-weight:400;line-height:1.1;margin:18px 0}
p{color:#bfb4a7;font:13px/1.8 Arial,sans-serif;margin:0 auto 27px;max-width:280px}
input{display:block;width:100%;text-align:center;letter-spacing:.55em;
font:22px Arial,sans-serif;color:#f5eee5;background:#ffffff08;
border:1px solid #c7a36b66;padding:15px;margin-bottom:14px;outline:none}
input:focus{border-color:#d9b779}
button{width:100%;border:0;padding:16px;background:#d7b477;color:#19120c;
font:11px Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;cursor:pointer}
button:disabled{opacity:.6}
#error{color:#e8a69b;min-height:20px;font:12px Arial,sans-serif;margin-top:15px}
</style>
</head>
<body>
<main>
<div class="mark">♡</div>
<div class="eyebrow">A little universe, made for you</div>
<h1>One little secret.</h1>
<p>This story is just for you. Enter the special code to open it.</p>
<form id="unlock">
<input id="code" type="password" inputmode="numeric" pattern="[0-9]{6}"
maxlength="6" minlength="6" autocomplete="one-time-code"
placeholder="••••••" aria-label="Six digit access code" required>
<button type="submit">open the story →</button>
<div id="error" role="status" aria-live="polite"></div>
</form>
</main>
<script>
const form=document.getElementById('unlock');
const input=document.getElementById('code');
const error=document.getElementById('error');
const button=form.querySelector('button');
form.addEventListener('submit',async e=>{
  e.preventDefault();
  error.textContent='';
  button.disabled=true;
  button.textContent='Opening…';
  try{
    const response=await fetch('/__birthday_unlock',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({code:input.value})
    });
    if(response.ok){location.replace('/');return;}
    error.textContent=response.status===503
      ?'Password protection is not configured yet.'
      :'That code didn’t match. Try again.';
    input.value='';
    input.focus();
  }catch{
    error.textContent='Could not connect. Please try again.';
  }finally{
    button.disabled=false;
    button.textContent='Open your story →';
  }
});
</script>
</body>
</html>`;
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(signature), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

async function hasValidSession(
  request: Request,
  secret: string,
): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return false;

  const [timestamp, signature, extra] = cookie
    .slice(COOKIE_NAME.length + 1)
    .split(".");

  if (!timestamp || !signature || extra) return false;

  const issuedAt = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt > now + 60 ||
    now - issuedAt > SESSION_SECONDS
  ) {
    return false;
  }

  const expected = await sign(timestamp, secret);
  if (expected.length !== signature.length) return false;

  let difference = 0;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return difference === 0;
}

async function handleUnlock(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const origin = request.headers.get("origin");

  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return new Response("Forbidden", { status: 403 });
      }
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (!env.BIRTHDAY_PASSCODE || !env.SESSION_SECRET) {
    return Response.json(
      { error: "Password protection is not configured." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  let body: { code?: unknown };

  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    return Response.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }

  const supplied = typeof body.code === "string" ? body.code : "";
  const expected = env.BIRTHDAY_PASSCODE;

  if (!/^\d{6}$/.test(supplied) || !/^\d{6}$/.test(expected)) {
    return Response.json(
      { error: "Incorrect code" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  let difference = 0;

  for (let i = 0; i < 6; i++) {
    difference |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  }

  if (difference !== 0) {
    return Response.json(
      { error: "Incorrect code" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = await sign(timestamp, env.SESSION_SECRET);

  return Response.json(
    { ok: true },
    {
      headers: {
        "set-cookie":
          `${COOKIE_NAME}=${timestamp}.${signature}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store",
      },
    },
  );
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as {
      unhandled?: unknown;
      message?: unknown;
    };

    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(
    consumeLastCapturedError() ??
      new Error(`h3 swallowed SSR error: ${body}`),
  );

  return htmlResponse(renderErrorPage(), 500);
}

/**
 * IMPORTANT:
 * TanStack Start may invoke this entry as an internal SSR handler with
 * only a Request. Cloudflare's Worker env is not guaranteed to be passed
 * to this function. Never assume secrets exist here.
 */

export default {
  async fetch(request: Request, env?: Env, ctx?: unknown) {
    try {
      // Nitro sets this from the actual Cloudflare Worker environment.
      const workerEnv = (
        globalThis as typeof globalThis & { __env__?: Env }
      ).__env__;

      const runtimeEnv = env ?? workerEnv;
      const url = new URL(request.url);

      // Never allow access if the secrets aren't available.
      if (
        !runtimeEnv?.BIRTHDAY_PASSCODE ||
        !runtimeEnv?.SESSION_SECRET
      ) {
        return url.pathname === "/__birthday_unlock"
          ? Response.json(
              { error: "Password protection is not configured." },
              { status: 503, headers: { "cache-control": "no-store" } },
            )
          : htmlResponse(loginPage(), 503);
      }

      if (url.pathname === "/__birthday_unlock") {
        return await handleUnlock(request, runtimeEnv);
      }

      if (!(await hasValidSession(request, runtimeEnv.SESSION_SECRET))) {
        return htmlResponse(loginPage());
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request);

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return htmlResponse(renderErrorPage(), 500);
    }
  },
};
