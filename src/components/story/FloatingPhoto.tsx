import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import type { Photo } from "@/data/story";

type Props = Photo & {
  className?: string;
  /** Load eagerly (first visible image). */
  priority?: boolean;
  /** Delay for the mount reveal when not scroll triggered */
  scroll?: boolean;
};

/**
 * Reusable floating photograph: masked reveal on scroll, parallax drift,
 * gentle hover lift, caption, and gradient fallback when the image fails.
 */
export function FloatingPhoto({ src, alt, caption, aspect = 3 / 4, rotate = 0, depth = 0.5, className = "", priority, scroll = true }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const trigger = { trigger: wrap.current, start: "top 90%" };
      const st = scroll ? { scrollTrigger: trigger } : {};
      gsap.fromTo(mask.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out", ...st, delay: scroll ? 0 : 0.3 });
      gsap.fromTo(mask.current!.querySelector(".photo-img"), { scale: 1.35 }, { scale: 1, duration: 2.2, ease: "expo.out", ...st });
      if (depth > 0) {
        gsap.to(wrap.current, {
          yPercent: -18 * depth, ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    }, wrap);
    return () => ctx.revert();
  }, [depth, scroll]);

  return (
    <div ref={wrap} className={`will-change-transform ${className}`}>
      <motion.figure
        className="photo-frame"
        style={{ rotate }}
        whileHover={{ rotate: rotate * 0.3, scale: 1.04, y: -8 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <div ref={mask} className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
          {failed ? (
            <div className="photo-img photo-fallback absolute inset-0" role="img" aria-label={alt} />
          ) : (
            <img
              className="photo-img absolute inset-0 h-full w-full object-cover"
              src={src}
              alt={alt}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={() => setFailed(true)}
            />
          )}
        </div>
        {caption && (
          <figcaption className="font-display absolute bottom-2 left-3 text-base italic text-ink">{caption}</figcaption>
        )}
      </motion.figure>
    </div>
  );
}
