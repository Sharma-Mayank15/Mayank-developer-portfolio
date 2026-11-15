"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";

/** Fades + lifts children into view once, when they scroll on screen. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ "--delay": `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Card whose border-glow follows the cursor. */
export function Spotlight({ children, className = "", as: Tag = "div", ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag onMouseMove={onMove} className={`card spotlight ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHeading({ index, label, title, children }) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[11px] text-signal">{index}</span>
        <span className="h-px w-8 bg-white/15" />
        <span className="eyebrow">{label}</span>
      </div>
      <h2 className="max-w-3xl text-balance text-3xl font-medium tracking-tight text-fg sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {children && <p className="mt-5 max-w-2xl text-pretty text-fg-muted">{children}</p>}
    </Reveal>
  );
}

/** Live local time in Chandigarh — renders only after mount to avoid hydration mismatch. */
export function LocalTime({ className = "" }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now
    ? now.toLocaleTimeString("en-GB", { timeZone: personalData.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  return <span className={`tabular-nums ${className}`} suppressHydrationWarning>{time}</span>;
}

export function CopyEmail({ className = "", children }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(personalData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personalData.email}`;
    }
  };
  return (
    <button type="button" onClick={copy} className={className} aria-label="Copy email address">
      {children ?? personalData.email}
      {copied ? <FiCheck className="text-ok" /> : <FiCopy className="opacity-60" />}
      <span className="sr-only" aria-live="polite">{copied ? "Email copied" : ""}</span>
    </button>
  );
}

/* ---------- Scroll-driven primitives ---------- */

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Calls `onFrame(scrollY)` once after mount and then at most once per animation frame while the
 * page scrolls or resizes. Meant for writing transforms straight to element styles (no setState).
 * Does nothing when the user prefers reduced motion, so elements keep their static styles.
 */
export function useScrollFrame(onFrame) {
  const cb = useRef(onFrame);
  useEffect(() => {
    cb.current = onFrame;
  });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const run = () => {
      raf = 0;
      cb.current(window.scrollY);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

/**
 * Counts the numeric part of `value` up from 0 the first time it scrolls into view, keeping any
 * prefix/suffix ("90%+", "−35%", "1+"). Server-renders the final value, so it stays correct
 * without JS and under reduced motion.
 */
export function CountUp({ value, duration = 1400, className = "" }) {
  const text = String(value);
  const match = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const numRef = useRef(null);
  const target = match ? parseFloat(match[2]) : 0;
  const decimals = match ? (match[2].split(".")[1] || "").length : 0;

  useEffect(() => {
    const el = numRef.current;
    if (!el || !target || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const final = target.toFixed(decimals);
    let raf = 0;
    el.textContent = (0).toFixed(decimals);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, Math.max(0, (t - start) / duration));
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = p < 1 ? (target * eased).toFixed(decimals) : final;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = final;
    };
  }, [target, decimals, duration]);

  if (!match) return <span className={className}>{text}</span>;
  return (
    <span className={`tabular-nums ${className}`}>
      <span aria-hidden>
        {match[1]}
        <span ref={numRef}>{match[2]}</span>
        {match[3]}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** Gentle 3D tilt toward the cursor. Mouse only — inert on touch devices and under reduced motion. */
export function Tilt({ children, className = "", max = 4 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let rx = 0;
    let ry = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) - 0.5;
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) - 0.5;
      ry = px * 2 * max;
      rx = -py * 2 * max;
      el.style.transitionDuration = "200ms"; // follow the cursor quickly…
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.transitionDuration = ""; // …and ease back slowly (class duration)
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [max]);

  return (
    <div ref={ref} className={`transition-transform duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
}
