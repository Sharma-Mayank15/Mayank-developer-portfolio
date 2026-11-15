"use client";

import { useEffect, useRef, useState } from "react";

// Illustrative event stream — a nod to the real-time work, not real client data.
const EVENTS = [
  { type: "dispatch.update", body: "unit_14 → en_route", tone: "fg" },
  { type: "guard.checkpoint", body: "tour_07 · gate_b ✓", tone: "ok" },
  { type: "detection.alert", body: "cam_03 no_helmet 0.91", tone: "signal" },
  { type: "call.created", body: "#4821 priority=high", tone: "fg" },
  { type: "rag.score", body: "candidate_218 → 92/100", tone: "ok" },
  { type: "session.booked", body: "coach_12 · stripe ✓", tone: "ok" },
  { type: "review.queued", body: "alert_5531 → human", tone: "signal" },
  { type: "dqn.step", body: "phase NS→EW · r=+0.42", tone: "fg" },
];

const tone = { fg: "text-fg", ok: "text-ok", signal: "text-signal" };

export default function HeroConsole() {
  const [rows, setRows] = useState(() => EVENTS.slice(0, 5).map((e, i) => ({ ...e, id: i, t: "" })));
  const [count, setCount] = useState(5);
  const next = useRef(5); // monotonically increasing id — keeps row keys unique

  useEffect(() => {
    const stamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
    setRows((r) => r.map((row) => ({ ...row, t: stamp() })));
    const id = setInterval(() => {
      const n = next.current++;
      const row = { ...EVENTS[n % EVENTS.length], id: n, t: stamp() };
      setRows((r) => [row, ...r.filter((x) => x.id !== n)].slice(0, 6));
      setCount(n + 1);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card w-full max-w-sm bg-ink-900/80 font-mono text-[11.5px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur" aria-hidden>
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <span className="text-fg-dim">socket · live-events</span>
        <span className="flex items-center gap-1.5 text-ok">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" /> {count}
        </span>
      </div>
      <ul className="space-y-0.5 p-3">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="grid grid-cols-[4.2rem_1fr] gap-2 rounded-md px-2 py-1.5 transition-all duration-500"
            style={{ opacity: 1 - i * 0.14, background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent" }}
          >
            <span className="text-fg-dim tabular-nums">{r.t || "--:--:--"}</span>
            <span className="truncate">
              <span className={tone[r.tone]}>{r.type}</span> <span className="text-fg-muted">{r.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
