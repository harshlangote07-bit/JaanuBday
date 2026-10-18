import type { ReactNode } from "react";

/** Consistent chapter shell with a deliberate forward button. */
export function StoryChapter({ children, cta, onNext, ctaDisabled, className = "", ctaClassName = "" }: {
  children: ReactNode;
  cta?: string;
  onNext?: () => void;
  ctaDisabled?: boolean;
  className?: string;
  ctaClassName?: string;
}) {
  return (
    <section className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      {children}
      {cta && onNext && (
        <div className={`relative z-10 flex justify-center pb-24 pt-10 ${ctaClassName}`}>
          <button className="btn-story chapter-cta" onClick={onNext} disabled={ctaDisabled}>
            {cta} <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </section>
  );
}
