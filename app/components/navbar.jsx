"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiCommand, FiMenu, FiX } from "react-icons/fi";

export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "work", label: "AI Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Stack" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lens, setLens] = useState(null); // { left, width } of the active tab
  const linkRefs = useRef({});

  // Slide the glass lens under whichever tab is active.
  useLayoutEffect(() => {
    const measure = () => {
      const el = linkRefs.current[active];
      setLens(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const openPalette = () => window.dispatchEvent(new Event("open-command-palette"));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`glass pointer-events-auto flex w-full max-w-3xl items-center justify-between rounded-full px-2 py-2 transition-all duration-500 ${
          scrolled || open ? "glass-raised" : ""
        }`}
        aria-label="Main"
      >
        <Link href="/#top" className="flex items-center gap-2.5 rounded-full py-1 pl-2 pr-3" onClick={() => setOpen(false)}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-fg font-serif text-base italic leading-none text-ink-950">
            m
          </span>
          <span className="text-sm font-medium text-fg">Mayank Sharma</span>
        </Link>

        <ul className="relative hidden items-center md:flex">
          <span
            aria-hidden
            className="glass-lens absolute inset-y-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
            style={lens ? { left: lens.left, width: lens.width, opacity: 1 } : { left: 0, width: 0, opacity: 0 }}
          />
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id} ref={(el) => (linkRefs.current[id] = el)}>
              <a
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                className={`relative block rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300 ${
                  active === id ? "text-white" : "text-fg-muted hover:text-fg"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            onClick={openPalette}
            className="glass-lens hidden items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] text-fg-muted transition-colors hover:text-fg sm:flex"
            aria-label="Open command menu"
          >
            <FiCommand /> K
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-fg md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass glass-raised pointer-events-auto absolute inset-x-4 top-[4.5rem] rounded-3xl p-3 md:hidden">
          {NAV_LINKS.map(({ id, label }, i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg text-fg hover:bg-white/5"
            >
              {label}
              <span className="font-mono text-xs text-fg-dim">0{i + 1}</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
