import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { story } from "@/data/story";
import { Particles } from "./Particles";

export function IntroScene({ onNext }: { onNext: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".intro-glow", { opacity: 0, scale: 0.4, duration: 3 })
        .from(".intro-whisper", { opacity: 0, letterSpacing: "0.8em", duration: 2 }, 0.6)
        .from(".intro-line .word", { yPercent: 110, opacity: 0, stagger: 0.08, duration: 1.4 }, 1.2)
        .from(".intro-line", { filter: "blur(12px)", stagger: 1, duration: 2 }, 1.2)
        .from(".chapter-cta", { opacity: 0, y: 20, duration: 1.2 }, "-=0.4");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="intro-glow glow-orb left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2" />
      <Particles count={90} />
      <p className="intro-whisper eyebrow relative mb-10">{story.intro.whisper}</p>
      <div className="relative space-y-3">
        {story.intro.lines.map((line, i) => (
          <h1 key={i} className={`intro-line headline-lg overflow-hidden ${i === 1 ? "italic text-gold-gradient" : ""}`}>
            {line.split(" ").map((w, j) => (
              <span key={j} className="inline-block overflow-hidden pb-2 align-bottom">
                <span className="word inline-block">{w}&nbsp;</span>
              </span>
            ))}
          </h1>
        ))}
      </div>
      <button className="btn-story chapter-cta relative mt-16" onClick={onNext} autoFocus>
        {story.intro.cta} <span aria-hidden>→</span>
      </button>
    </section>
  );
}
