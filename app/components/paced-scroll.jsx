"use client";

import { useEffect } from "react";

// How far ahead of the current position the wheel may push the page (px). A fast spin can't outrun this,
// so sections can't be skipped past in one flick. Tighter inside the pinned project stories.
const LEAD = 620;
const LEAD_STORY = 300;
const STEP = 110; // max distance a single wheel event adds
const STEP_STORY = 50; // ...and inside a project story, where each layer deserves a look
const EASE = 0.11; // share of the remaining distance covered per frame

/**
 * Paces mouse-wheel scrolling: eased, with a speed ceiling. Wheel only — touch, keyboard, scrollbar
 * dragging and anchor links keep their native behaviour. Disabled for reduced motion and touch devices.
 */
export default function PacedScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let target = window.scrollY;
    let raf = 0;
    let stories = [];
    let storiesAt = 0;

    const inStory = (y) => {
      const now = performance.now();
      if (now - storiesAt > 1500) {
        storiesAt = now;
        stories = [...document.querySelectorAll('section[id^="story-"]')].map((el) => {
          const top = el.getBoundingClientRect().top + window.scrollY;
          return [top, top + el.offsetHeight - window.innerHeight];
        });
      }
      return stories.some(([a, b]) => y >= a && y <= b);
    };

    // Let inner scrollable areas (e.g. the command menu list) handle their own wheel.
    const scrollsInside = (el, dy) => {
      for (; el && el !== document.body; el = el.parentElement) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
        }
      }
      return false;
    };

    const tick = () => {
      const y = window.scrollY;
      const diff = target - y;
      if (Math.abs(diff) < 0.6) {
        raf = 0;
        return;
      }
      window.scrollTo({ top: y + diff * EASE, behavior: "instant" });
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) return; // pinch-zoom / browser zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal gestures
      if (scrollsInside(e.target, e.deltaY)) return;
      e.preventDefault();

      const y = window.scrollY;
      if (!raf) target = y; // re-sync after native scrolling (anchors, keyboard, scrollbar)
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      const story = inStory(y);
      const step = story ? STEP_STORY : STEP;
      const lead = story ? LEAD_STORY : LEAD;
      const delta = Math.max(-step, Math.min(step, e.deltaY * unit));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, Math.max(y - lead, Math.min(y + lead, target + delta))));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Any other way of scrolling cancels the eased motion so the two never fight.
    const cancel = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onKey = (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) cancel();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("hashchange", cancel);
    return () => {
      cancel();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("hashchange", cancel);
    };
  }, []);

  return null;
}
