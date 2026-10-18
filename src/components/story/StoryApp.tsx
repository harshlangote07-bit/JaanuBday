import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { IntroScene } from "./IntroScene";
import { AppreciationScene, BeginningScene, FinaleScene, MemoriesScene, TurningScene } from "./Chapters";
import { BirthdayReveal } from "./BirthdayReveal";
import { LetterReveal } from "./LetterReveal";
import { MusicToggle } from "./MusicToggle";

const CHAPTERS = ["Opening", "Beginning", "Memories", "Appreciation", "Pause", "Celebration", "Letter", "Finale"];

export function StoryApp() {
  const [chapter, setChapter] = useState(0);
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const go = useCallback((next: number) => {
    if (busy.current) return;
    const swap = () => {
      setChapter(next);
      window.scrollTo(0, 0);
    };
    if (prefersReducedMotion()) return swap();
    busy.current = true;
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .set(curtain.current, { display: "block" })
      .fromTo(curtain.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.inOut" })
      .add(swap)
      .to(curtain.current, { opacity: 0, duration: 1.2, ease: "power2.inOut", delay: 0.25 })
      .set(curtain.current, { display: "none" });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(id);
  }, [chapter]);

  const next = () => go(Math.min(chapter + 1, CHAPTERS.length - 1));

  return (
    <>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <MusicToggle />
      <nav aria-label="Chapters" className="fixed left-5 top-1/2 z-[70] hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {CHAPTERS.map((name, i) => (
          <button key={name} onClick={() => i <= chapter && go(i)} disabled={i > chapter}
            aria-label={`Chapter: ${name}`} aria-current={i === chapter ? "step" : undefined}
            className={`h-px transition-all duration-700 ${i === chapter ? "w-10 bg-gold" : i < chapter ? "w-5 bg-gold/50 hover:w-8" : "w-3 bg-foreground/15"}`} />
        ))}
      </nav>
      <p className="eyebrow fixed left-5 top-6 z-[70] text-muted-foreground">
        {String(chapter + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
      </p>

      <main tabIndex={-1} className="outline-none">
        {chapter === 0 && <IntroScene onNext={next} />}
        {chapter === 1 && <BeginningScene onNext={next} />}
        {chapter === 2 && <MemoriesScene onNext={next} />}
        {chapter === 3 && <AppreciationScene onNext={next} />}
        {chapter === 4 && <TurningScene onNext={next} />}
        {chapter === 5 && <BirthdayReveal onNext={next} />}
        {chapter === 6 && <LetterReveal onNext={next} />}
        {chapter === 7 && <FinaleScene onRestart={() => go(0)} />}
      </main>

      <div ref={curtain} aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden bg-background" />
    </>
  );
}
