import { useEffect, useRef, useState } from "react";
import { story } from "@/data/story";

/** Optional music. Starts only on click. Uses story.music.src, or a soft generated pad. */
export function MusicToggle() {
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const synth = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  const startSynth = () => {
    if (!synth.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 900;
      filter.connect(gain); gain.connect(ctx.destination);
      [146.83, 220, 277.18, 329.63].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? "sine" : "triangle";
        o.frequency.value = f;
        const lfo = ctx.createOscillator(); const lg = ctx.createGain();
        lfo.frequency.value = 0.07 + i * 0.03; lg.gain.value = 1.5;
        lfo.connect(lg); lg.connect(o.detune); lfo.start();
        const og = ctx.createGain(); og.gain.value = 0.05;
        o.connect(og); og.connect(filter); o.start();
      });
      synth.current = { ctx, gain };
    }
    const { ctx, gain } = synth.current;
    ctx.resume();
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);
  };
  const stopSynth = () => {
    const s = synth.current; if (!s) return;
    s.gain.gain.linearRampToValueAtTime(0, s.ctx.currentTime + 0.8);
  };

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (story.music.src) {
      if (!audio.current) { audio.current = new Audio(story.music.src); audio.current.loop = true; audio.current.volume = 0.5; }
      if (next) audio.current.play().catch(() => setOn(false)); else audio.current.pause();
    } else {
      if (next) startSynth(); else stopSynth();
    }
  };

  useEffect(() => () => { audio.current?.pause(); synth.current?.ctx.close(); }, []);

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Turn music on"}
      className="eyebrow fixed right-5 top-5 z-[70] flex items-center gap-3 rounded-full px-3 py-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold"
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-[2px] bg-gold transition-all duration-500"
            style={{ height: on ? `${[60, 100, 45, 80][i]}%` : "20%", animation: on ? `flicker ${0.6 + i * 0.2}s ease-in-out infinite` : "none" }} />
        ))}
      </span>
      {story.music.label} {on ? "on" : "off"}
    </button>
  );
}
