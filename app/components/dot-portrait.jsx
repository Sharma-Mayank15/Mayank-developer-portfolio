"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiGrid } from "react-icons/fi";

const CELL = 5; // px between dot centres
const REACH = 70; // px radius in which dots react to the pointer
const INTRO_MS = 1400;
// Framing for the dot view: where the face is in the photo (0-1), where it should sit in the card, and how far to zoom in.
const FOCUS = { x: 0.5, y: 0.345 };
const ANCHOR = { x: 0.5, y: 0.44 };
const ZOOM = 1.6;

/**
 * A halftone dot field that reacts to the pointer; clicking it (or the button) reveals the real photo.
 * `dotSrc` is the artwork the dots are sampled from. Without it the dots are sampled from the photo itself.
 */
export default function DotPortrait({ src, dotSrc, alt, dotLabel = "dots", revealLabel = "Reveal photo", hint, children }) {
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

    const art = Boolean(dotSrc); // artwork is drawn to fit the card, so it needs no face-framing or vignette
    const img = new window.Image();
    img.src = dotSrc || src;

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
      const focus = art ? { x: 0.5, y: 0.5 } : FOCUS;
      const anchor = art ? { x: 0.5, y: 0.5 } : ANCHOR;
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (art ? 1 : ZOOM);
      const sw = w / scale;
      const sh = h / scale;
      // Crop so the face (FOCUS) lands on ANCHOR, clamped to the photo's edges.
      const sx = Math.min(img.naturalWidth - sw, Math.max(0, focus.x * img.naturalWidth - anchor.x * sw));
      const sy = Math.min(img.naturalHeight - sh, Math.max(0, focus.y * img.naturalHeight - anchor.y * sh));
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
          const fall = art ? 1 : Math.min(1, Math.max(0, 1.25 - Math.hypot(vx, vy)));
          const b = Math.pow(lum, art ? 1 : 0.7) * (0.18 + 0.82 * fall * fall);
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
      wrap.style.setProperty("--mx", `${pointer.x}px`);
      wrap.style.setProperty("--my", `${pointer.y}px`);
      wrap.dataset.peek = "1";
      start();
    };
    const onLeave = () => {
      pointer.on = false;
      delete wrap.dataset.peek;
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
  }, [src, dotSrc]);

  const showPhoto = revealed;

  return (
    <div ref={wrapRef} className="card h-full min-h-[22rem]">
      <Image
        src={src}
        alt={alt}
        aria-hidden={!revealed}
        fill
        sizes="(min-width: 768px) 24rem, 100vw"
        className={`object-cover object-[50%_30%] transition-opacity duration-700 ${showPhoto ? "opacity-100" : "opacity-0"}`}
      />
      {/* Without JS there are no dots to click through, so show the photo directly. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
      </noscript>
      <canvas
        ref={canvasRef}
        aria-hidden
        onClick={() => setRevealed(true)}
        className={`absolute inset-0 h-full w-full cursor-pointer bg-ink-900 transition-opacity duration-700 ${
          showPhoto ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ touchAction: "pan-y" }}
      />
      {/* Peek lens: under the cursor, a small circle of the real photo shows through — a hint that the helmet hides someone. */}
      {dotSrc && !revealed && (
        <div
          aria-hidden
          className="dot-peek pointer-events-none absolute inset-0 bg-cover"
          style={{ backgroundImage: `url("${src}")`, backgroundPosition: "50% 30%" }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />

      {ready && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-pressed={revealed}
          className="glass-lens absolute right-3 top-3 flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] text-fg transition-colors hover:text-white"
        >
          {revealed ? (
            <FiGrid />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
          )}
          {revealed ? `Back to ${dotLabel}` : revealLabel}
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
        {hint && ready && !revealed && <div className="mb-3 font-mono text-[11px] text-fg-muted">{hint}</div>}
        {children}
      </div>
    </div>
  );
}
