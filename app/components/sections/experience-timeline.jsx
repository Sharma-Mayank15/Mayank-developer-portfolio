"use client";

import { useEffect, useRef, useState } from "react";
import { Spotlight } from "../ui";
import styles from "./experience.module.scss";

/** Where the rail's fill head sits, as a fraction of viewport height. */
const HEAD = 0.72;
const STAGGER_MS = 70;

/**
 * Product cards on a scroll-driven rail. The fill and node/card activation are
 * written straight to the DOM (CSS variable + data attribute) from a
 * rAF-throttled scroll listener, so scrolling never re-renders React.
 */
export function ExperienceTimeline({ products }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const items = Array.from(root.querySelectorAll("[data-item]"));
    let frame = 0;
    let readyFrame = 0;
    let enabled = false;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      if (!rect.height) return;
      const head = window.innerHeight * HEAD;
      const filled = Math.min(Math.max(head - rect.top, 0), rect.height);
      root.style.setProperty("--progress", (filled / rect.height).toFixed(4));
      for (const item of items) {
        const node = item.querySelector("[data-node]");
        const n = node.getBoundingClientRect();
        const active = n.top + n.height / 2 <= rect.top + filled;
        if ((item.dataset.active === "true") !== active) item.dataset.active = String(active);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      update();
      root.classList.add(styles.live);
      // Turn transitions on only after the initial state has been painted.
      readyFrame = requestAnimationFrame(() => {
        readyFrame = requestAnimationFrame(() => root.classList.add(styles.ready));
      });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(readyFrame);
      frame = 0;
      root.classList.remove(styles.live, styles.ready);
      root.style.removeProperty("--progress");
      for (const item of items) delete item.dataset.active;
    };

    const onMotionChange = () => (mq.matches ? disable() : enable());
    onMotionChange();
    mq.addEventListener("change", onMotionChange);

    return () => {
      mq.removeEventListener("change", onMotionChange);
      disable();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.timeline}>
      <div className={styles.rail} aria-hidden>
        <div className={styles.fill} />
      </div>

      {products.map((p, i) => (
        <div key={p.name} data-item className={styles.item}>
          <span data-node className={styles.node} aria-hidden>
            <span className={styles.ring} />
            <span className={styles.lit} />
            <span className={styles.tick} />
          </span>

          <div className={styles.body}>
            <Spotlight className="p-6 sm:p-7 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="eyebrow mb-2">Client product · {p.region}</div>
                  <h4 className="text-xl font-medium text-fg md:text-2xl">{p.name}</h4>
                  <p className="mt-1 text-fg-muted">{p.kind}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-fg-dim">0{i + 1}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.points.map((pt, j) => (
                  <li
                    key={pt}
                    className={`${styles.stagger} flex gap-3 text-[15px] leading-relaxed text-fg-muted`}
                    style={{ "--d": `${120 + j * STAGGER_MS}ms` }}
                  >
                    <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-signal" />
                    <span className="min-w-0">{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {p.stack.map((s, j) => (
                  <span
                    key={s}
                    className={`${styles.stagger} chip`}
                    style={{ "--d": `${160 + p.points.length * STAGGER_MS + j * 40}ms` }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Spotlight>
          </div>
        </div>
      ))}
    </div>
  );
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function tenure(start, now) {
  const [mon, year] = String(start).trim().split(/\s+/);
  const m = MONTHS.indexOf(mon?.slice(0, 3).toLowerCase());
  const y = Number(year);
  if (m < 0 || !Number.isFinite(y)) return null;
  const total = (now.getFullYear() - y) * 12 + (now.getMonth() - m);
  if (total < 1) return null;
  const yrs = Math.floor(total / 12);
  const mos = total % 12;
  return [yrs && `${yrs} yr${yrs > 1 ? "s" : ""}`, mos && `${mos} mo${mos > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

/** "1 yr 3 mos" since `start` ("Aug 2025"). Computed after mount so server and client HTML match. */
export function TimeInRole({ start }) {
  const [label, setLabel] = useState(null);
  useEffect(() => setLabel(tenure(start, new Date())), [start]);
  if (!label) return null;
  return (
    <span className={`${styles.tenure} inline-flex items-center gap-2 text-fg-dim`}>
      <span aria-hidden>·</span>
      <span className="tabular-nums">{label}</span>
    </span>
  );
}
