import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { story } from "@/data/story";
import { Particles } from "./Particles";

/**
 * Cinematic letter reveal — calm, slow, one continuous shot.
 * Click → letterbox bars close in, the envelope opens and fades into the dark,
 * the letter fades up with a slow camera push, then each line appears in turn.
 */
export function LetterReveal({ onNext }: { onNext: () => void }) {
  const c = story.letter;
  const paragraphs: string[] = Array.isArray(c.paragraphs) ? c.paragraphs : [];
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  /* Idle: the envelope simply fades in and rests */
  useEffect(() => {
    if (open || !root.current) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) { gsap.set([".l-envelope-wrap", ".l-hint"], { autoAlpha: 1 }); return; }
      gsap.fromTo(".l-envelope-wrap", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1.6, ease: "power2.out" });
      gsap.fromTo(".l-hint", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, delay: 1.2, ease: "sine.out" });
    }, root);
    return () => ctx.revert();
  }, [open]);

  /* The reveal */
  useEffect(() => {
    if (!open || !root.current) return;
    let done = false;
    const finish = () => {
      if (!done) { done = true; setReady(true); }
    };

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>(".l-line");

      if (prefersReducedMotion()) {
        gsap.set([".l-letter", ".l-cta", ...lines], { autoAlpha: 1 });
        gsap.set(".l-envelope-wrap", { autoAlpha: 0 });
        finish();
        return;
      }

      gsap.set(".l-letter", { autoAlpha: 0, scale: 1.06, y: 24 });
      gsap.set(lines, { autoAlpha: 0, y: 10 });
      gsap.set(".l-cta", { autoAlpha: 0, y: 10 });

      const tl = gsap.timeline({ defaults: { ease: "sine.inOut" }, onComplete: finish });

      tl
        // Letterbox + dim: the room goes quiet
        .to(".l-bar", { scaleY: 1, duration: 1.4, ease: "power2.inOut" }, 0)
        .to(".l-dim", { autoAlpha: 1, duration: 1.6 }, 0)
        // Envelope opens slowly
        .to(".l-seal", { autoAlpha: 0, scale: 0.9, duration: 0.6 }, 0.2)
        .to(".l-flap", { rotateX: 180, duration: 1.4, ease: "power2.inOut" }, 0.4)
        // Envelope fades into the dark
        .to(".l-envelope-wrap", { autoAlpha: 0, scale: 0.96, duration: 1.2 }, 1.5)
        // Letter fades up with a slow camera push (crossfade, no gap)
        .to(".l-letter", { autoAlpha: 1, y: 0, duration: 1.6, ease: "power2.out" }, 1.9)
        .to(".l-letter", { scale: 1, duration: 3.2, ease: "power1.out" }, 1.9)
        // Lines appear one after another
        .to(lines, {
          autoAlpha: 1, y: 0, duration: 1.1, ease: "power2.out",
          stagger: Math.min(0.45, 2.6 / Math.max(lines.length, 1)),
        }, 2.4)
        // Bars ease back, button appears
        .to(".l-bar", { scaleY: 0.4, duration: 1.4, ease: "power2.inOut" }, ">-0.6")
        .to(".l-dim", { autoAlpha: 0.5, duration: 1.4 }, "<")
        .to(".l-cta", { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, "<0.3");

      const skip = () => tl.progress() < 1 && tl.timeScale(3);
      root.current?.querySelector(".l-letter")?.addEventListener("click", skip);
    }, root);

    const safety = window.setTimeout(finish, 9000);
    return () => { window.clearTimeout(safety); ctx.revert(); };
  }, [open]);

  const hide = { opacity: 0, visibility: "hidden" as const };
  const ink = "var(--ink, var(--foreground))";

  return (
    <div ref={root}>
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-14">
        <Particles count={30} warm />

        {/* Darkening */}
        <div
          aria-hidden
          className="l-dim pointer-events-none absolute inset-0 z-0"
          style={{ ...hide, background: `radial-gradient(ellipse at center, transparent 35%, color-mix(in oklab, ${ink} 60%, transparent) 100%)` }}
        />
        {/* Letterbox bars */}
        <div aria-hidden className="l-bar pointer-events-none absolute inset-x-0 top-0 z-40 h-[7vh] origin-top" style={{ background: ink, transform: "scaleY(0)" }} />
        <div aria-hidden className="l-bar pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[7vh] origin-bottom" style={{ background: ink, transform: "scaleY(0)" }} />

        <p className="eyebrow relative z-10 mb-8 text-center">{c.eyebrow}</p>

        <div className="relative z-10 mx-auto grid w-full max-w-2xl place-items-center">
          {/* Envelope */}
          <div className="l-envelope-wrap col-start-1 row-start-1 flex flex-col items-center [perspective:1200px]" style={hide}>
            <button
              className="l-envelope relative block aspect-[3/2] w-[min(86vw,28rem)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8"
              onClick={() => !open && setOpen(true)}
              aria-label="Open the letter"
              disabled={open}
            >
              <div className="paper absolute inset-0 shadow-2xl" />
              <svg viewBox="0 0 300 200" className="absolute inset-0 z-10 h-full w-full" aria-hidden preserveAspectRatio="none">
                <path d="M0 0 L150 112 L0 200Z" fill="var(--paper)" stroke={ink} strokeOpacity=".12" />
                <path d="M300 0 L150 112 L300 200Z" fill="var(--paper)" stroke={ink} strokeOpacity=".12" />
                <path d="M0 200 L150 100 L300 200Z" fill="var(--paper)" stroke={ink} strokeOpacity=".15" />
              </svg>
              <div className="l-flap absolute inset-x-0 top-0 z-20 h-[58%] origin-top">
                <svg viewBox="0 0 300 100" className="h-full w-full drop-shadow-md" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 0 L150 100 L300 0Z" fill="var(--paper)" stroke={ink} strokeOpacity=".18" />
                </svg>
              </div>
              <span className="l-seal absolute left-1/2 top-[58%] z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent font-display text-2xl italic text-accent-foreground shadow-lg">
                {story.recipient.name[0]}
              </span>
            </button>
            {!open && <p className="l-hint eyebrow mt-10 text-center text-muted-foreground">{c.openHint}</p>}
          </div>

          {/* Letter */}
          {open && (
            <article className="l-letter col-start-1 row-start-1 w-full max-w-xl will-change-transform" style={hide} aria-label="Birthday letter">
              <div className="paper px-6 py-10 shadow-2xl sm:px-10 sm:py-12 md:px-14 md:py-14">
                <h2 className="l-line font-display text-3xl italic sm:text-4xl">{c.greeting}</h2>
                {paragraphs.map((p, i) => (
                  <p key={i} className="l-line mt-5 font-display text-lg leading-relaxed sm:text-xl md:text-2xl">{p}</p>
                ))}
                <p className="l-line mt-8 font-display text-lg italic sm:text-xl">{c.signoff}</p>
                <p className="l-line mt-2 font-display text-4xl italic sm:text-5xl">{c.signature}</p>
              </div>
            </article>
          )}
        </div>

        {open && (
          <div className="l-cta relative z-20 mx-auto mt-10 flex justify-center pb-[max(2rem,env(safe-area-inset-bottom))]" style={hide}>
            <button className="btn-story" onClick={onNext} disabled={!ready} aria-disabled={!ready}>
              {c.cta} <span aria-hidden>→</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}