"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./spartan-bot.module.scss";

const SIZE = 48; // rendered width in px
const SPEED = 70; // px per second
const FALL_MS = 1500;
const GETUP_MS = 650;

/**
 * A small Spartan robot that patrols the bottom edge of the page. Click it and it topples over,
 * lies there seeing stars, then gets back up and carries on. Purely decorative (aria-hidden).
 */
export default function SpartanBot() {
  const botRef = useRef(null);
  const [mode, setMode] = useState("run"); // run | idle | fall | up
  const [enabled, setEnabled] = useState(false);
  const sim = useRef({ x: 24, dir: 1, mode: "run", until: 0, nextPause: 0, boost: 0 });

  useEffect(() => {
    // Under reduced motion the bot simply isn't shown — a figure pacing the screen is exactly what that setting is for.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = botRef.current;
    const s = sim.current;
    let raf = 0;
    let last = performance.now();
    s.nextPause = last + 4000 + Math.random() * 5000;

    const set = (m, now, ms = 0) => {
      s.mode = m;
      s.until = now + ms;
      setMode(m);
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const max = window.innerWidth - SIZE - 8;

      if (s.mode === "run") {
        s.x += s.dir * SPEED * (now < s.boost ? 2.1 : 1) * dt;
        if (s.x >= max) {
          s.x = max;
          s.dir = -1;
        } else if (s.x <= 8) {
          s.x = 8;
          s.dir = 1;
        }
        if (now > s.nextPause) set("idle", now, 900 + Math.random() * 1400);
      } else if (now > s.until) {
        if (s.mode === "idle") {
          if (Math.random() < 0.4) s.dir *= -1;
          s.nextPause = now + 4000 + Math.random() * 6000;
          set("run", now);
        } else if (s.mode === "fall") {
          set("up", now, GETUP_MS);
        } else if (s.mode === "up") {
          // Back on its feet: dash away from wherever it was knocked over.
          s.boost = now + 1600;
          s.nextPause = now + 5000 + Math.random() * 5000;
          set("run", now);
        }
      }
      el.style.transform = `translate3d(${Math.round(s.x)}px, 0, 0)`;
      el.dataset.dir = s.dir;
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  const knock = () => {
    const s = sim.current;
    if (s.mode === "fall" || s.mode === "up") return;
    s.mode = "fall";
    s.until = performance.now() + FALL_MS;
    setMode("fall");
  };

  if (!enabled) return null;

  return (
    <div className={styles.track} aria-hidden>
      <div ref={botRef} className={styles.bot} data-mode={mode} data-dir="1" onPointerDown={knock} title="Don't push me">
        <div className={styles.flip}>
          <svg viewBox="0 0 48 56" width={SIZE} height={(SIZE * 56) / 48} className={styles.figure}>
            {/* stars, shown while it's down */}
            <g className={styles.stars} fill="#ff6b2c">
              <path d="M8 6l1.2 2.6L12 9.8l-2.8 1.2L8 13.6 6.8 11 4 9.8l2.8-1.2z" />
              <path d="M24 0l1 2.2 2.2 1-2.2 1L24 6.4l-1-2.2-2.2-1 2.2-1z" />
              <path d="M40 6l1.2 2.6L44 9.8l-2.8 1.2L40 13.6 38.800 11 36 9.800l2.800-1.200z" />
            </g>
            <g className={styles.body}>
              {/* spear and cape */}
              <path d="M9 48L19 3" stroke="#a6a8b0" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M19 3l2.600-1.400-.4 4.400z" fill="#ededef" />
              <path className={styles.cape} d="M16 28L5 43l11-2z" fill="#ff6b2c" />
              {/* legs */}
              <rect className={styles.legA} x="17.500" y="40" width="5" height="12" rx="2.200" fill="#6c6e78" />
              <rect className={styles.legB} x="25.500" y="40" width="5" height="12" rx="2.200" fill="#8e9099" />
              {/* torso */}
              <rect x="14.500" y="26" width="19" height="16" rx="5.500" fill="#8e9099" />
              {/* helmet with crest */}
              <path d="M13 11C15 2 31 0 37 8l-3.200 3C29 6 20 7 16.500 13z" fill="#ff6b2c" />
              <rect x="13" y="9" width="23" height="19" rx="8.500" fill="#d3d4da" />
              <rect x="21" y="15" width="15" height="6.500" rx="2.400" fill="#0c0d10" />
              <circle className={styles.eye} cx="30.500" cy="18.200" r="2" fill="#ff6b2c" />
              <path className={styles.eyeX} d="M28.500 16.200l4 4m0-4l-4 4" stroke="#ff6b2c" strokeWidth="1.300" strokeLinecap="round" />
              {/* shield */}
              <circle cx="33" cy="36" r="9" fill="#e4e5ea" stroke="#55575f" strokeWidth="1.600" />
              <path d="M29 40.500l4-9.500 4 9.500" stroke="#2a2b31" strokeWidth="2.200" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </svg>
        </div>
        <span className={styles.shadow} />
      </div>
    </div>
  );
}
