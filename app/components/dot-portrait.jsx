"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiEye, FiGrid } from "react-icons/fi";

const CELL = 5; // px between dot centres
const REACH = 70; // px radius in which dots react to the pointer
const INTRO_MS = 1400;
// Framing for the dot view: where the face is in the photo (0-1), where it should sit in the card, and how far to zoom in.
const FOCUS = { x: 0.5, y: 0.345 };
const ANCHOR = { x: 0.5, y: 0.44 };
const ZOOM = 1.6;

/**
 * Portrait rendered as a halftone dot field that reacts to the pointer; a button swaps in the real photo.
 * The photo is what is in the HTML, so it stays visible if JS or canvas is unavailable. The dots only
 * take over once they have actually been drawn.
 */
export default function DotPortrait({ src, alt, children }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, on: false };
    let dots = [];
    let raf = 0;
    let introStart = 0;
    let w = 0;
    let h = 0;
    let alive = true;

    const img = new window.Image();
    img.src = src;

    const build = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      if (!w || !h || !img.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Downsample the photo (object-cover crop) so that one pixel = one dot.
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * ZOOM;
      const sw = w / scale;
      const sh = h / scale;
      // Crop so the face (FOCUS) lands on ANCHOR, clamped to the photo's edges.
      const sx = Math.min(img.naturalWidth - sw, Math.max(0, FOCUS.x * img.naturalWidth - ANCHOR.x * sw));
      const sy = Math.min(img.naturalHeight - sh, Math.max(0, FOCUS.y * img.naturalHeight - ANCHOR.y * sh));
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const px = octx.getImageData(0, 0, cols, rows).data;

      // Stretch contrast between the 5th and 95th luminance percentiles so a dim photo still reads.
      const lums = new Float32Array(cols * rows);
      for (let i = 0; i < lums.length; i++) lums[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
      const sorted = Float32Array.from(lums).sort();
      const lo = sorted[Math.floor(sorted.length * 0.05)];
      const hi = sorted[Math.floor(sorted.length * 0.95)] || 1;

      dots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lum = Math.min(1, Math.max(0, (lums[r * cols + c] - lo) / (hi - lo || 1)));
          // Vignette: fade the background out so the face is the subject, not the wall behind it.
          const vx = (c / cols - ANCHOR.x) / 0.8;
          const vy = (r / rows - ANCHOR.y) / 0.9;
          const fall = Math.min(1, Math.max(0, 1.25 - Math.hypot(vx, vy)));
          const b = Math.pow(lum, 0.7) * (0.18 + 0.82 * fall * fall);
          if (b < 0.06) continue;
          dots.push({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2, b, delay: Math.random() * 0.6 + (r / rows) * 0.4 });
        }
      }
      introStart = performance.now();
      start();
      setReady(true);
    };

    const draw = (now) => {
      raf = 0;
      if (!alive) return;
      const intro = reduced ? 1 : Math.min(1, (now - introStart) / INTRO_MS);
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        // Each dot grows in on its own schedule (top to bottom, with jitter).
        const k = reduced ? 1 : Math.min(1, Math.max(0, (intro - d.delay * 0.6) / 0.4));
        if (k <= 0) continue;
        let { x, y } = d;
        let radius = (CELL / 2) * d.b * 0.92 * k;
        let near = 0;
        if (pointer.on) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REACH) {
            near = 1 - dist / REACH;
            const push = near * near * 7;
            x += (dx / (dist || 1)) * push;
            y += (dy / (dist || 1)) * push;
            radius *= 1 + near * 0.45;
          }
        }
        if (near > 0.05) {
          // Blend from off-white to the signal orange as the pointer gets closer.
          const g = 107 + Math.round(130 * (1 - near));
          const bl = 44 + Math.round(195 * (1 - near));
          ctx.fillStyle = `rgba(255,${g},${bl},${0.5 + 0.5 * d.b})`;
        } else {
          ctx.fillStyle = `rgba(237,237,239,${0.3 + 0.7 * d.b})`;
        }
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.3, radius), 0, Math.PI * 2);
        ctx.fill();
      }
      if (intro < 1 || pointer.on) raf = requestAnimationFrame(draw);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.on = true;
      start();
    };
    const onLeave = () => {
      pointer.on = false;
      start(); // one more frame to settle the dots back
    };

    if (img.complete && img.naturalWidth) build();
    else img.addEventListener("load", build);
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      img.removeEventListener("load", build);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, [src]);

  const showPhoto = revealed || !ready;

  return (
    <div ref={wrapRef} className="card h-full min-h-[22rem]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 24rem, 100vw"
        className={`object-cover object-[50%_30%] transition-opacity duration-700 ${showPhoto ? "opacity-100" : "opacity-0"}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        onClick={() => setRevealed(true)}
        className={`absolute inset-0 h-full w-full cursor-pointer bg-ink-900 transition-opacity duration-700 ${
          showPhoto ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ touchAction: "pan-y" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />

      {ready && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-pressed={revealed}
          className="glass-lens absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] text-fg transition-colors hover:text-white"
        >
          {revealed ? <FiGrid /> : <FiEye />}
          {revealed ? "Back to dots" : "Reveal photo"}
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">{children}</div>
    </div>
  );
}
