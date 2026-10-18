import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { story } from "@/data/story";
import { FloatingPhoto } from "./FloatingPhoto";
import { StoryChapter } from "./StoryChapter";
import { Particles } from "./Particles";

function useGsap(fn: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(fn, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/* ───── Chapter I ───── */
export function BeginningScene({ onNext }: { onNext: () => void }) {
  const c = story.beginning;
  const ref = useGsap(() => {
    gsap.from(".b-eyebrow", { opacity: 0, y: 20, duration: 1.2, delay: 0.2 });
    gsap.from(".b-title span", { yPercent: 105, duration: 1.6, ease: "expo.out", stagger: 0.15, delay: 0.3 });
    gsap.from(".b-body", { opacity: 0, y: 30, duration: 1.4, scrollTrigger: { trigger: ".b-body", start: "top 85%" } });
  });
  const pos = [
    "md:absolute md:left-[6%] md:top-[44vh] md:w-[24vw]",
    "md:absolute md:right-[8%] md:top-[18vh] md:w-[20vw]",
    "md:absolute md:right-[30%] md:top-[92vh] md:w-[30vw]",
  ];
  return (
    <div ref={ref}>
      <StoryChapter cta={c.cta} onNext={onNext}>
        <div className="glow-orb -left-40 top-20 h-[60vmin] w-[60vmin] opacity-60" />
        <div className="relative px-6 pt-28 md:px-[8vw] md:pt-36">
          <p className="b-eyebrow eyebrow mb-8">{c.eyebrow}</p>
          <h2 className="b-title headline-xl max-w-[12ch]">
            {c.title.map((t, i) => (
              <span key={i} className="block overflow-hidden"><span className={`block ${i ? "italic text-gold-gradient" : ""}`}>{t}</span></span>
            ))}
          </h2>
        </div>
        <div className="relative mt-16 grid grid-cols-2 gap-6 px-6 md:mt-0 md:block md:h-[140vh]">
          {c.photos.map((p, i) => (
            <FloatingPhoto key={i} {...p} priority={i === 0} className={`${pos[i]} ${i === 2 ? "col-span-2 mx-auto w-4/5" : ""}`} />
          ))}
        </div>
        <p className="b-body font-display relative mx-auto mt-16 max-w-xl px-6 text-center text-2xl leading-relaxed text-muted-foreground md:-mt-[10vh] md:ml-[8vw] md:text-left md:text-3xl">
          {c.body}
        </p>
      </StoryChapter>
    </div>
  );
}

/* ───── Chapter II ───── */
export function MemoriesScene({ onNext }: { onNext: () => void }) {
  const c = story.memories;
  const ref = useGsap(() => {
    gsap.from(".m-title", { opacity: 0, y: 60, duration: 1.6, ease: "expo.out", delay: 0.2 });
    gsap.utils.toArray<HTMLElement>(".m-text").forEach((el) => {
      gsap.from(el, { opacity: 0, x: el.dataset["side"] === "l" ? -40 : 40, filter: "blur(8px)", duration: 1.4, scrollTrigger: { trigger: el, start: "top 80%" } });
    });
  });
  return (
    <div ref={ref}>
      <StoryChapter cta={c.cta} onNext={onNext}>
        <Particles count={40} />
        <div className="relative px-6 pt-28 md:px-[8vw] md:pt-36">
          <p className="eyebrow mb-8">{c.eyebrow}</p>
          <h2 className="m-title headline-lg max-w-[16ch]">{c.title}</h2>
        </div>
        <div className="relative mt-20 space-y-28 px-6 md:space-y-10 md:px-[8vw]">
          {c.items.map((m, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={i} className={`flex flex-col items-center gap-10 md:min-h-[80vh] md:flex-row md:gap-[8vw] ${flip ? "md:flex-row-reverse" : ""}`}>
                <FloatingPhoto {...m.photo} className="w-4/5 md:w-[34vw]" />
                <div className="m-text max-w-md" data-side={flip ? "l" : "r"}>
                  <span className="font-display text-7xl italic text-gold/40">0{i + 1}</span>
                  <p className="font-display mt-2 text-3xl leading-snug md:text-4xl">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </StoryChapter>
    </div>
  );
}

/* ───── Chapter III ───── */
export function AppreciationScene({ onNext }: { onNext: () => void }) {
  const c = story.appreciation;
  const [i, setI] = useState(0);
  const last = i === c.messages.length - 1;
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="glow-orb left-1/2 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 opacity-50" />
      <p className="eyebrow absolute top-28">{c.eyebrow}</p>
      <div className="relative flex min-h-[40vh] max-w-4xl items-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            className="headline-lg"
            initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {c.messages[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="relative mt-6 flex gap-2" aria-hidden>
        {c.messages.map((_, k) => (
          <span key={k} className={`h-px transition-all duration-700 ${k <= i ? "w-10 bg-gold" : "w-5 bg-gold/25"}`} />
        ))}
      </div>
      <div className="relative mt-14">
        {last ? (
          <button className="btn-story" onClick={onNext}>{c.cta} <span aria-hidden>→</span></button>
        ) : (
          <button className="btn-story" onClick={() => setI(i + 1)}>{c.nextLine} <span aria-hidden>↓</span></button>
        )}
      </div>
    </section>
  );
}

/* ───── Chapter IV ───── */
export function TurningScene({ onNext }: { onNext: () => void }) {
  const c = story.turning;
  const ref = useGsap(() => {
    const tl = gsap.timeline();
    tl.fromTo(".t-bg", { opacity: 0 }, { opacity: 1, duration: 4, ease: "sine.inOut" })
      .from(".t-line", { opacity: 0, y: 24, filter: "blur(10px)", duration: 1.6, stagger: 1.4 }, 0.5)
      .from(".chapter-cta", { opacity: 0, duration: 1.2 }, "+=0.3");
  });
  return (
    <div ref={ref}>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="t-bg absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, var(--warm-bg), var(--background) 70%)" }} />
        <div className="t-bg glow-orb left-1/2 top-[55%] h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2" />
        <Particles count={110} warm />
        <p className="eyebrow relative mb-12">{c.eyebrow}</p>
        <div className="relative max-w-4xl space-y-4">
          {c.lines.map((l, i) => (
            <p key={i} className={`t-line font-display text-3xl md:text-5xl ${i === c.lines.length - 1 ? "italic text-gold-gradient text-5xl md:text-7xl" : ""}`}>{l}</p>
          ))}
        </div>
        <button className="btn-story chapter-cta relative mt-16" onClick={onNext}>{c.cta} <span aria-hidden>→</span></button>
      </section>
    </div>
  );
}

/* ───── Finale ───── */
export function FinaleScene({ onRestart }: { onRestart: () => void }) {
  const c = story.finale;
  const ref = useGsap(() => {
    gsap.from(".f-line", { opacity: 0, y: 40, filter: "blur(10px)", duration: 1.8, stagger: 1.2, delay: 0.3 });
    gsap.from(".f-restart", { opacity: 0, duration: 1.5, delay: 3.2 });
  });
  return (
    <div ref={ref}>
      <section className="relative flex min-h-screen flex-col items-center justify-center gap-14 overflow-hidden px-6 py-28 md:flex-row md:gap-[6vw]">
        <Particles count={60} warm />
        <FloatingPhoto {...c.photo} scroll={false} priority depth={0} className="relative w-3/5 max-w-sm md:w-[26vw]" />
        <div className="relative text-center md:text-left">
          <h2 className="f-line headline-lg">{c.lines[0]}</h2>
          <p className="f-line font-display mt-6 text-3xl italic text-gold-gradient md:text-5xl">{c.lines[1]}</p>
          <p className="f-line eyebrow mt-10 text-muted-foreground">— {story.from}</p>
          <button onClick={onRestart} className="f-restart mt-14 text-xs uppercase tracking-[0.3em] text-muted-foreground underline-offset-8 transition hover:text-gold hover:underline focus-visible:text-gold">
            ↺ {c.restart}
          </button>
        </div>
      </section>
    </div>
  );
}
