import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { story } from "@/data/story";
import { Particles } from "./Particles";
import { FloatingPhoto } from "./FloatingPhoto";

function Confetti({ burst }: { burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const w = (c.width = c.clientWidth), h = (c.height = c.clientHeight);
    const colors = ["#f3d79a", "#e6b45c", "#fff3d6", "#c9913d", "#f7e6c4"];
    const ps = Array.from({ length: 160 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.3, y: h * 0.45,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      s: Math.random() * 6 + 3, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0] ?? "#f3d79a", life: 0,
    }));
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of ps) {
        p.life++; p.vy += 0.22; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y < h + 20) alive++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 260);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2.2);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [burst]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}

function Cake({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40 md:h-48 md:w-48" aria-hidden>
      <defs>
        <linearGradient id="cake" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f7e6c4" /><stop offset="1" stopColor="#c9a46a" />
        </linearGradient>
        <radialGradient id="halo"><stop offset="0" stopColor="#ffd98a" stopOpacity=".7" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
      </defs>
      {lit && <circle cx="100" cy="48" r="45" fill="url(#halo)" />}
      <rect x="96" y="58" width="8" height="42" rx="2" fill="#fff3d6" />
      {lit ? (
        <path className="flame" d="M100 30 C108 42 108 52 100 58 C92 52 92 42 100 30Z" fill="#ffcf6b" />
      ) : (
        <path d="M100 56 q-6 -10 2 -18 q-4 -8 4 -16" stroke="#cfc6b8" strokeWidth="2" fill="none" opacity=".6">
          <animate attributeName="opacity" values=".6;0" dur="3s" fill="freeze" />
        </path>
      )}
      <rect x="40" y="100" width="120" height="60" rx="6" fill="url(#cake)" />
      <path d="M40 112 q15 12 30 0 t30 0 t30 0 t30 0" stroke="#fff3d6" strokeWidth="6" fill="none" />
      <rect x="28" y="160" width="144" height="8" rx="4" fill="#8a6a3c" />
    </svg>
  );
}

export function BirthdayReveal({ onNext }: { onNext: () => void }) {
  const c = story.reveal;
  const root = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(0);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) { setBurst(1); return; }
      const tl = gsap.timeline();
      tl.fromTo(".r-flash", { opacity: 1 }, { opacity: 0, duration: 2.2, ease: "power2.out" })
        .from(".r-pre", { opacity: 0, y: 20, letterSpacing: "0.6em", duration: 1.6 }, 0.4)
        .from(".r-you", { opacity: 0, scale: 0.6, filter: "blur(20px)", duration: 1.6, ease: "expo.out" }, 1.4)
        .from(".r-head span", { yPercent: 120, duration: 1.4, ease: "expo.out", stagger: 0.18 }, 2.4)
        .add(() => setBurst((b) => b + 1), 2.7)
        .from(".r-rest", { opacity: 0, y: 30, duration: 1.2, stagger: 0.2 }, 3.4);
    }, root);
    return () => ctx.revert();
  }, []);

  const wish = () => { setWished(true); setBurst((b) => b + 1); };

  return (
    <div ref={root}>
      <section className="relative min-h-screen overflow-hidden px-6 pb-24 pt-28 text-center">
        <div className="r-flash pointer-events-none fixed inset-0 z-30 bg-gold" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, var(--warm-bg), var(--background) 75%)" }} />
        <Particles count={140} warm />
        {burst > 0 && <Confetti key={burst} burst={burst} />}

        <p className="r-pre eyebrow relative text-sm">{c.pre}</p>
        <p className="r-you font-display relative mt-4 text-6xl italic text-gold-gradient md:text-8xl">{c.you}</p>
        <h1 className="r-head relative mt-10 font-display font-light leading-[0.85] tracking-tight" style={{ fontSize: "clamp(4rem, 17vw, 17rem)" }}>
          {c.headline.map((h, i) => (
            <span key={i} className="block overflow-hidden"><span className={`block ${i ? "text-gold-gradient italic" : ""}`}>{h}</span></span>
          ))}
        </h1>
        <p className="r-rest font-display relative mt-6 text-2xl text-muted-foreground">{story.recipient.name} · {story.recipient.birthday}</p>

        <div className="r-rest relative mx-auto mt-16 grid max-w-5xl items-center gap-10 md:grid-cols-3">
          <FloatingPhoto {...c.photos[0]!} className="mx-auto w-4/5 md:w-full" />
          <div className="flex flex-col items-center gap-6">
            <Cake lit={!wished} />
            <AnimatePresence mode="wait">
              {wished ? (
                <motion.p key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display max-w-xs text-2xl italic" aria-live="polite">{c.afterWish}</motion.p>
              ) : (
                <motion.button key="wish" exit={{ opacity: 0 }} className="btn-story" onClick={wish}>{c.wishButton}</motion.button>
              )}
            </AnimatePresence>
          </div>
          <FloatingPhoto {...c.photos[1]!} className="mx-auto w-3/5 md:w-4/5" />
        </div>

        <div className="r-rest relative mt-20">
          <button className="btn-story" onClick={onNext}>{c.cta} <span aria-hidden>→</span></button>
        </div>
      </section>
    </div>
  );
}
