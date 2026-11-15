"use client";

import { useEffect, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

const TAG_TONE = {
  launch: "text-ok",
  outage: "text-signal",
  research: "text-fg",
  industry: "text-fg",
  news: "text-fg-muted",
};

function ago(ms, now) {
  const m = Math.max(1, Math.round((now - ms) / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
}

/** Hero card: today's top AI & tech stories. Headlines are fetched on the server (utils/ai-news.js). */
export default function AiWire({ items, className = "" }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(null); // set after mount — relative times would mismatch during hydration

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Walk the highlight down the list; hovering or focusing the card hands control to the reader.
  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (!items.length) return null;

  return (
    <aside
      aria-label="Today in AI and tech"
      className={`card w-full bg-ink-900/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-fg">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          AI wire
        </span>
        <span className="text-fg-dim">today in AI &amp; tech</span>
      </div>

      <ol className="p-2">
        {items.map((n, i) => (
          <li key={n.id}>
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setActive(i)}
              className={`group block rounded-lg px-3 py-2.5 transition-colors duration-300 ${
                i === active ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
              }`}
            >
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                <span className={TAG_TONE[n.tag]}>{n.tag}</span>
                <span className="text-fg-dim">·</span>
                <span className="truncate normal-case tracking-normal text-fg-dim">{n.source}</span>
                <span className="ml-auto shrink-0 normal-case tracking-normal text-fg-dim" suppressHydrationWarning>
                  {now ? `${ago(n.time, now)} ago` : ""}
                </span>
              </span>
              <span
                className={`mt-1 flex items-start gap-2 text-[13px] leading-snug transition-colors duration-300 ${
                  i === active ? "text-fg" : "text-fg-muted group-hover:text-fg"
                }`}
              >
                <span className="line-clamp-2 flex-1">{n.title}</span>
                <FiArrowUpRight className="mt-0.5 shrink-0 text-fg-dim opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 font-mono text-[10px] text-fg-dim">
        <span className="truncate pr-3">via Hacker News · updates every 30 min</span>
        <a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-fg">
          more ↗
        </a>
      </div>
    </aside>
  );
}
