"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowUpRight, FiCornerDownLeft, FiFileText, FiGithub, FiHash, FiLinkedin, FiMail, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { personalData } from "@/utils/data/personal-data";
import { NAV_LINKS } from "./navbar";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  const actions = useMemo(
    () => [
      ...NAV_LINKS.map((l) => ({
        group: "Navigate",
        label: l.label,
        icon: FiHash,
        run: () => document.getElementById(l.id)?.scrollIntoView({ behavior: "smooth" }),
      })),
      {
        group: "Actions",
        label: "Copy email address",
        icon: FiMail,
        run: async () => {
          await navigator.clipboard.writeText(personalData.email).catch(() => {});
          toast.success("Email copied to clipboard");
        },
      },
      { group: "Actions", label: "Open résumé", icon: FiFileText, external: true, run: () => window.open(personalData.resume, "_blank", "noopener") },
      { group: "Links", label: "GitHub", icon: FiGithub, external: true, run: () => window.open(personalData.github, "_blank", "noopener") },
      { group: "Links", label: "LinkedIn", icon: FiLinkedin, external: true, run: () => window.open(personalData.linkedIn, "_blank", "noopener") },
    ],
    []
  );

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  if (!open) return null;

  const onInputKey = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === "Enter" && filtered[cursor]) {
      filtered[cursor].run();
      close();
    }
  };

  let lastGroup = null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 px-4 pt-[18vh] backdrop-blur-sm" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-ink-850 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <FiSearch className="text-fg-dim" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Type a command or search…"
            className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-dim"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-fg-dim">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-fg-dim">No results.</li>}
          {filtered.map((a, i) => {
            const header = a.group !== lastGroup ? a.group : null;
            lastGroup = a.group;
            const Icon = a.icon;
            return (
              <li key={a.label}>
                {header && <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-fg-dim">{header}</div>}
                <button
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    a.run();
                    close();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                    cursor === i ? "bg-white/[0.07] text-fg" : "text-fg-muted"
                  }`}
                >
                  <Icon className="shrink-0" />
                  <span className="flex-1">{a.label}</span>
                  {a.external && <FiArrowUpRight className="text-fg-dim" />}
                  {cursor === i && <FiCornerDownLeft className="text-fg-dim" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
