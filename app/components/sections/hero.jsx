import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";
import { CopyEmail, LocalTime, Reveal } from "../ui";
import HeroConsole from "./hero-console";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32">
      {/* backdrop */}
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[-12rem] h-[34rem] w-[58rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(closest-side, #ff6b2c, transparent)" }}
        aria-hidden
      />

      <div className="container-page relative">
        <Reveal delay={400} className="absolute right-8 top-24 hidden xl:block">
          <HeroConsole />
        </Reveal>
        <Reveal>
          <a
            href={personalData.companyUrl}
            target="_blank"
            rel="noreferrer"
            className="group mb-10 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-4 text-xs text-fg-muted backdrop-blur transition-colors hover:border-white/20 hover:text-fg"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            <span className="hidden sm:inline">Currently Software Engineer at</span>
            <span className="sm:hidden">Now at</span>
            <span className="whitespace-nowrap text-fg">{personalData.company}</span>
            <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="text-[clamp(3.2rem,11vw,9.5rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-fg">
            Mayank
            <br />
            <span className="text-white/30">Sharma</span>
            <span className="text-signal">.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-10 max-w-2xl text-balance text-xl leading-relaxed text-fg-muted sm:text-2xl">
            AI engineer building <em className="font-serif text-[1.15em] italic text-fg">intelligent systems</em> —
            computer vision, LLMs &amp; RAG, deep RL — and the{" "}
            <em className="font-serif text-[1.15em] italic text-fg">real-time products</em> that put them in users&apos; hands.
          </p>
        </Reveal>

        <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#work" className="btn-primary">
            See selected work <FiArrowDown />
          </a>
          <a href={personalData.resume} target="_blank" rel="noreferrer" className="btn-ghost">
            Résumé <FiArrowUpRight />
          </a>
          <CopyEmail className="btn text-fg-muted hover:text-fg" />
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-20 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-6 sm:grid-cols-4">
            {[
              ["Based in", personalData.location],
              ["Local time", <LocalTime key="t" />],
              ["Focus", "Applied AI · LLMs · CV"],
              ["Ships with", "React · TypeScript · FastAPI"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="eyebrow mb-1.5">{k}</div>
                <div className="font-mono text-sm text-fg">{v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
