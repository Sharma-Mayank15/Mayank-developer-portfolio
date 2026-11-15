import { personalData } from "@/utils/data/personal-data";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="container-page flex flex-col items-start justify-between gap-4 py-8 text-sm text-fg-dim sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {personalData.name}. Designed &amp; built from scratch.
        </p>
        <div className="flex items-center gap-5 font-mono text-xs">
          <span className="hidden sm:inline">
            Press <kbd className="rounded border border-white/10 px-1.5 py-0.5">⌘ / Ctrl</kbd> <kbd className="rounded border border-white/10 px-1.5 py-0.5">K</kbd>
          </span>
          <a href="#top" className="hover:text-fg">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
