"use client";

import { useRef } from "react";
import { useScrollFrame } from "./ui";

/** 2px reading-progress bar pinned above the nav. Written straight to the element style per frame. */
export default function ScrollProgress() {
  const bar = useRef(null);

  useScrollFrame((y) => {
    const el = bar.current;
    if (!el) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    el.style.transform = `scaleX(${p.toFixed(4)})`;
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-signal will-change-transform" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
