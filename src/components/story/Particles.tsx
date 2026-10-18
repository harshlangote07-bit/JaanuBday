import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Atmospheric drifting dust. `warm` makes them denser and more golden. */
export function Particles({ count = 70, warm = false }: { count?: number; warm?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const n = window.innerWidth < 700 ? Math.round(count * 0.55) : count;
    const ps = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * (warm ? 2.2 : 1.6) + 0.3,
      vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.25 - 0.05,
      a: Math.random() * 0.6 + 0.15, t: Math.random() * Math.PI * 2,
    }));
    const still = prefersReducedMotion();
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!still) {
          p.x += p.vx; p.y += p.vy; p.t += 0.02;
          if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        }
        const alpha = p.a * (0.6 + Math.sin(p.t) * 0.4);
        ctx.beginPath();
        ctx.fillStyle = warm ? `rgba(255,205,120,${alpha})` : `rgba(240,215,170,${alpha * 0.8})`;
        ctx.shadowBlur = warm ? 10 : 6;
        ctx.shadowColor = "rgba(255,200,110,0.8)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count, warm]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
