
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

const COOKIE_NAME = "jaanu_bday_access";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

function htmlResponse(
  html: string,
  status = 200,
  headers?: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "text/html; charset=utf-8");
  responseHeaders.set("cache-control", "no-store");

  return new Response(html, {
    status,
    headers: responseHeaders,
  });
}

function getEnv(env?: Env): Env {
  const globalEnv = (
    globalThis as typeof globalThis & { __env__?: Env }
  ).__env__;

  return env ?? globalEnv ?? {};
}

async function getServerEntry(): Promise<ServerEntry> {
  const serverModule = (await import(
    "@tanstack/react-start/server-entry"
  )) as {
    default?: ServerEntry;
    fetch?: ServerEntry["fetch"];
  };

  const entry = serverModule.default ?? serverModule;

  if (typeof entry.fetch !== "function") {
    throw new Error("TanStack server entry does not expose fetch().");
  }

  return entry as ServerEntry;
}

function loginPage(message = ""): string {
  const safeMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A Little Surprise</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: linear-gradient(145deg, #fff0f4, #fce7f3, #fff7ed);
      color: #54243a;
      font-family: Georgia, "Times New Roman", serif;
    }
    main {
      width: min(100%, 390px);
      padding: 34px 26px;
      text-align: center;
      background: rgba(255,255,255,.88);
      border: 1px solid #f3c9d8;
      border-radius: 24px;
      box-shadow: 0 20px 70px rgba(120,40,75,.12);
    }
    .heart { font-size: 42px; }
    h1 { margin: 12px 0; font-size: 30px; }
    p { color: #87556b; line-height: 1.6; }
    input, button {
      width: 100%;
      min-height: 48px;
      border-radius: 12px;
      font: inherit;
    }
    input {
      margin: 12px 0;
      padding: 12px;
      text-align: center;
      letter-spacing: 8px;
      border: 1px solid #e8b5c8;
      outline-color: #c95c86;
      background: white;
      font-family: sans-serif;
      font-size: 20px;
    }
    button {
      border: 0;
      color: white;
      background: #b83d70;
      cursor: pointer;
    }
    button:disabled { opacity: .65; cursor: wait; }
    #message { min-height: 24px; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <div class="heart" aria-hidden="true">♡</div>
    <h1>A little surprise</h1>
    <p>Enter your special code to open your birthday surprise.</p>
    <form id="unlock-form">
      <label for="code">Your six-digit code</label>
      <input id="code" name="code" type="password"
        inputmode="numeric" pattern="[0-9]{6}" maxlength="6"
        autocomplete="one-time-code" required>
      <button id="submit" type="submit">Open my surprise</button>
    </form>
    <p id="message" role="status">${safeMessage}</p>
  </main>
  <script>
    const form = document.getElementById("unlock-form");
    const input = document.getElementById("code");
    const button = document.getElementById("submit");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.textContent = "";
      button.disabled = true;
      button.textContent = "Checking…";

      try {
        const response = await fetch("/__birthday_unlock", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ code: input.value })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.ok) {
          window.location.replace("/");
          return;
        }

        message.textContent = result.error ||
          (response.status === 503
            ? "Password protection is not configured on the server."
            : "That code is incorrect. Please try again.");
      } catch {
        message.textContent = "Could not connect. Please try again.";
      } finally {
        button.disabled = false;
        button.textContent = "Open my surprise";
      }
    });
  </script>
</body>
</html>`;
}

async function sign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let difference = 0;

  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return difference === 0;
}

async function hasValidSession(
  request: Request,
  secret: string,
): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(COOKIE_NAME + "="));

  if (!cookie) return false;

  const value = cookie.slice(COOKIE_NAME.length + 1);
  const separator = value.indexOf(".");

  if (separator < 1) return false;

  const timestamp = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  if (!/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const issuedAt = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt > now + 60 ||
    now - issuedAt > SESSION_DURATION_SECONDS
  ) {
    return false;
  }

  const expected = await sign(timestamp, secret);
  return constantTimeEqual(signature, expected);
}

async function handleUnlock(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed." },
      {
        status: 405,
        headers: { allow: "POST", "cache-control": "no-store" },
      },
    );
  }

  const url = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      if (new URL(origin).host !== url.host) {
        return Response.json(
          { error: "Invalid request origin." },
          { status: 403, headers: { "cache-control": "no-store" } },
        );
      }
    } catch {
      return Response.json(
        { error: "Invalid request origin." },
        { status: 403, headers: { "cache-control": "no-store" } },
      );
    }
  }

  const passcode = env.BIRTHDAY_PASSCODE;
  const sessionSecret = env.SESSION_SECRET;

  if (!passcode || !sessionSecret) {
    return Response.json(
      { error: "Password protection is not configured on the server." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const code =
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    typeof body.code === "string"
      ? body.code
      : "";

  if (!/^\d{6}$/.test(code) || !constantTimeEqual(code, passcode)) {
    return Response.json(
      { error: "Incorrect code. Please try again." },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = await sign(timestamp, sessionSecret);
  const cookieValue = `${timestamp}.${signature}`;

  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "set-cookie":
          `${COOKIE_NAME}=${cookieValue}; Path=/; Max-Age=${SESSION_DURATION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
      },
    },
  );
}

async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;

  const captured = consumeLastCapturedError();

  if (!captured) return response;

  return htmlResponse(renderErrorPage(), 500);
}

export default {
  async fetch(
    request: Request,
    env?: Env,
    _ctx?: unknown,
  ): Promise<Response> {
    try {
      const runtimeEnv = getEnv(env);
      const url = new URL(request.url);

      // Never allow the site to fall through unprotected if secrets are missing.
      if (!runtimeEnv.BIRTHDAY_PASSCODE || !runtimeEnv.SESSION_SECRET) {
        if (url.pathname === "/__birthday_unlock") {
          return Response.json(
            { error: "Password protection is not configured on the server." },
            { status: 503, headers: { "cache-control": "no-store" } },
          );
        }

        return htmlResponse(
          loginPage("Password protection is not configured on the server."),
          503,
        );
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
      console.error("Birthday site request failed:", error);
      return htmlResponse(renderErrorPage(), 500);
    }
  },
};
