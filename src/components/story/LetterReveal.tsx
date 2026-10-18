import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { story } from "@/data/story";
import { Particles } from "./Particles";

export function LetterReveal({ onNext }: { onNext: () => void }) {
  const c = story.letter;
  const paragraphs: string[] = Array.isArray(c.paragraphs) ? c.paragraphs : [];
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unfolded, setUnfolded] = useState(false);

  useEffect(() => {
    if (!open || !root.current) return;

    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const query = <T extends HTMLElement>(selector: string) =>
        root.current?.querySelector<T>(selector) ?? null;

      const flap = query<HTMLElement>(".l-flap");
      const envelope = query<HTMLElement>(".l-envelope");
      const letter = query<HTMLElement>(".l-letter");
      const stage = query<HTMLElement>(".l-letter-stage");
      const second = query<HTMLElement>(".l-fold-second");
      const third = query<HTMLElement>(".l-fold-third");
      const first = query<HTMLElement>(".l-fold-first");
      const contents = Array.from(
        root.current?.querySelectorAll<HTMLElement>(".l-fold-content") ?? []
      );

      if (!flap || !envelope || !letter || !stage || !first || !second || !third) {
        setUnfolded(true);
        return;
      }

      if (reduced) {
        gsap.set(flap, { rotateX: 180 });
        gsap.set(envelope, { autoAlpha: 0, y: 30 });
        gsap.set(letter, { autoAlpha: 1, y: 0 });
        gsap.set([second, third], { rotateX: 0, transformOrigin: "50% 0%" });
        gsap.set(contents, { autoAlpha: 1, y: 0 });
        requestAnimationFrame(() => {
          const totalHeight = first.offsetHeight + second.offsetHeight + third.offsetHeight;
          gsap.set(stage, { height: totalHeight });
        });
        setUnfolded(true);
        return;
      }

      gsap.set(letter, { autoAlpha: 0, y: 14 });
      gsap.set(stage, { height: 208 });
      gsap.set(second, { rotateX: -180, transformOrigin: "50% 0%" });
      gsap.set(third, { rotateX: -180, transformOrigin: "50% 0%" });
      gsap.set(contents, { autoAlpha: 0, y: 8 });
      if (contents[0]) gsap.set(contents[0], { autoAlpha: 1, y: 0 });
      if (contents[1]) gsap.set(contents[1], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          // Switch to natural height after the folds finish so the signature
          // and the button below it can never overlap or get clipped.
          // Absolute/nested folds do not contribute to their parent's natural
          // height, so explicitly size the stage to the sum of all three panels.
          const totalHeight = first.offsetHeight + second.offsetHeight + third.offsetHeight;
          gsap.set(stage, { height: totalHeight });
          setUnfolded(true);
        },
      });

      tl.to(flap, {
        rotateX: 180,
        duration: 0.7,
        ease: "power2.inOut",
      })
        .to(
          envelope,
          {
            y: 34,
            autoAlpha: 0,
            scale: 0.97,
            duration: 0.5,
            ease: "power2.in",
          },
          "-=0.05"
        )
        .to(
          letter,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
          "-=0.08"
        )
        .to(
          second,
          { rotateX: 0, duration: 0.9, ease: "power3.inOut" },
          "+=0.22"
        )
        .to(stage, { height: 416, duration: 0.8, ease: "power2.inOut" }, "<")
        .to(
          third,
          { rotateX: 0, duration: 0.9, ease: "power3.inOut" },
          "+=0.22"
        )
        .to(stage, {
          height: () => first.offsetHeight + second.offsetHeight + third.offsetHeight,
          duration: 0.8,
          ease: "power2.inOut",
        }, "<")
        .to(
          contents,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=0.3"
        );
    }, root);

    return () => ctx.revert();
  }, [open]);

  const panelClass =
    "paper relative flex min-h-[208px] w-full flex-col justify-center border-b border-[color:var(--ink)]/15 px-6 py-7 sm:px-10 sm:py-9 md:px-14 md:py-10";
  const contentClass = "l-fold-content";

  return (
    <div ref={root}>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden px-5 py-10 sm:py-12">
        <Particles count={50} warm />
        <p className="eyebrow relative mb-6 text-center">{c.eyebrow}</p>

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center">
          <button
            className={`l-envelope relative mx-auto block aspect-[3/2] w-[min(88vw,30rem)] cursor-pointer [perspective:900px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-gold ${
              open ? "pointer-events-none absolute inset-x-0 top-0" : ""
            }`}
            onClick={() => setOpen(true)}
            aria-label="Open the letter"
            disabled={open}
          >
            <div className="paper absolute inset-0 shadow-2xl" />
            <svg
              viewBox="0 0 300 200"
              className="absolute inset-0 h-full w-full"
              aria-hidden
              preserveAspectRatio="none"
            >
              <path d="M0 200 L150 95 L300 200Z" fill="var(--ink)" opacity=".08" />
              <path d="M0 0 L150 120 L300 0" fill="none" stroke="var(--ink)" strokeOpacity=".15" />
            </svg>
            <div className="l-flap absolute inset-x-0 top-0 h-1/2 origin-top [transform-style:preserve-3d]">
              <svg viewBox="0 0 300 100" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                <path d="M0 0 L150 100 L300 0Z" fill="var(--paper)" stroke="var(--ink)" strokeOpacity=".15" />
              </svg>
            </div>
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full bg-accent font-display text-2xl italic text-accent-foreground shadow-lg">
              {story.recipient.name[0]}
            </span>
          </button>

          {!open && <p className="eyebrow mt-8 text-center text-muted-foreground">{c.openHint}</p>}

          {open && (
            <article
              className="l-letter relative z-10 mx-auto mt-0 w-full max-w-xl [perspective:1400px]"
              style={{ opacity: 0 }}
              aria-label="Birthday letter"
            >
              <div className="l-letter-stage relative mx-auto w-full overflow-visible" style={{ height: 208 }}>
                <div className="l-fold-first paper relative z-30 min-h-[208px] w-full [transform-style:preserve-3d]">
                  <div className={panelClass}>
                    <h2 className={`${contentClass} font-display text-3xl italic sm:text-4xl`}>{c.greeting}</h2>
                    {paragraphs[0] && (
                      <p className={`${contentClass} mt-5 font-display text-lg leading-relaxed sm:text-xl md:text-2xl`}>
                        {paragraphs[0]}
                      </p>
                    )}
                  </div>

                  <div
                    className="l-fold-second paper absolute inset-x-0 top-full z-20 origin-top [backface-visibility:hidden] [transform-style:preserve-3d]"
                    style={{ transform: "rotateX(-180deg)" }}
                  >
                    <div className={panelClass}>
                      {paragraphs.slice(1, 3).map((paragraph, index) => (
                        <p key={`middle-${index}`} className={`${contentClass} ${index ? "mt-5" : ""} font-display text-lg leading-relaxed sm:text-xl md:text-2xl`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div
                      className="l-fold-third paper absolute inset-x-0 top-full z-10 origin-top [backface-visibility:hidden] [transform-style:preserve-3d]"
                      style={{ transform: "rotateX(-180deg)" }}
                    >
                      <div className={`${panelClass} border-b-0`}>
                        <p className={`${contentClass} font-display text-lg italic sm:text-xl`}>{c.signoff}</p>
                        <p className={`${contentClass} mt-2 font-display text-4xl italic sm:text-5xl`}>{c.signature}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>

        {open && (
          <div className="relative z-20 mx-auto mt-8 flex w-full shrink-0 justify-center pb-8">
            <button className="btn-story" onClick={onNext} disabled={!unfolded}>
              {c.cta} <span aria-hidden>→</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
