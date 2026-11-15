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
