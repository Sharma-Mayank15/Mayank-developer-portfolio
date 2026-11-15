"use client";

import { useRef } from "react";
import { useScrollFrame } from "../ui";
import styles from "./hero-parallax.module.scss";

/**
 * Renders the hero <section> and drives its scroll-out. Children opt in with `data-hero-layer`:
 *   backdrop — lags behind the page (slower than scroll)
 *   name     — scales down, drifts up and dims
 *   console  — leaves slightly faster than the page
 *   cue      — fades out as soon as scrolling begins
 * Every value is a pure function of scroll position, so it reverses exactly. Without JS or under
 * reduced motion nothing is written and the hero stays static.
 */
export default function HeroParallax({ children, className = "", ...rest }) {
  const ref = useRef(null);
  const last = useRef(-1);

  useScrollFrame((scrollY) => {
    const root = ref.current;
    if (!root) return;
    const h = root.offsetHeight || 1;
    const y = Math.min(h, Math.max(0, scrollY - root.offsetTop));
    if (y === last.current) return;
    last.current = y;
    // The name is gone after ~half a viewport, so run its scroll-out over 70% of the hero.
    const p = Math.min(1, y / (h * 0.7));

    for (const el of root.querySelectorAll("[data-hero-layer]")) {
      switch (el.dataset.heroLayer) {
        case "backdrop":
          el.style.transform = `translate3d(0, ${(y * 0.3).toFixed(1)}px, 0)`;
          break;
        case "name":
          el.style.transform = `translate3d(0, ${(-48 * p).toFixed(1)}px, 0) scale(${(1 - 0.08 * p).toFixed(4)})`;
          el.style.opacity = (1 - 0.75 * p).toFixed(3);
          break;
        case "console":
          el.style.transform = `translate3d(0, ${(-y * 0.14).toFixed(1)}px, 0)`;
          break;
        case "cue":
          el.style.opacity = Math.max(0, 1 - y / 140).toFixed(3);
          break;
      }
    }
  });

  return (
    <section ref={ref} className={className} {...rest}>
      {children}
    </section>
  );
}

/** "Scroll" hint pinned to the bottom of the hero; fades out as soon as scrolling begins. */
export function ScrollCue() {
  return (
    <div className={`${styles.cue} pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center sm:flex`} aria-hidden>
      <div data-hero-layer="cue" className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-fg-dim">Scroll</span>
        <span className="relative h-5 w-px overflow-hidden bg-white/10">
          <span className={`${styles.cueLine} absolute inset-0 bg-fg`} />
        </span>
      </div>
    </div>
  );
}
