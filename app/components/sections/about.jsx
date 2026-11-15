import { FiArrowUpRight, FiBookOpen, FiMapPin } from "react-icons/fi";
import { experiences } from "@/utils/data/experience";
import { personalData, stats } from "@/utils/data/personal-data";
import { marquee, research } from "@/utils/data/skills";
import DotPortrait from "../dot-portrait";
import TechIcon from "../tech-icon";
import { CountUp, LocalTime, Reveal, SectionHeading, Spotlight, Tilt } from "../ui";

export default function About() {
  const now = experiences[0];

  return (
    <section id="about" className="container-page py-24 md:py-32">
      <SectionHeading index="01" label="About" title={<>Building AI that <span className="font-serif italic text-fg-muted">actually ships</span>.</>} />

      <div className="grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-4 md:grid-cols-6">
        {/* Bio */}
        <Reveal className="md:col-span-4">
          <Spotlight className="h-full p-7 md:p-9">
            <div className="eyebrow mb-6">Hello</div>
            <p className="text-pretty text-lg leading-relaxed text-fg md:text-xl">{personalData.summary}</p>
            <p className="mt-5 text-pretty leading-relaxed text-fg-muted">
              My edge is the full path from model to product: training and evaluating the model, wrapping it in
              deterministic rules and human review where it matters, and building the interface people actually
              use. I work AI-native every day with Claude Code, MCP and agent workflows, and I&apos;m certified in it by
              Anthropic Academy, Google and Oracle.
            </p>
          </Spotlight>
        </Reveal>

        {/* Photo + location */}
        <Reveal delay={80} className="md:col-span-2">
          <Tilt className="h-full">
            <DotPortrait
              src={personalData.profile}
              dotSrc="/warrior.svg"
              dotLabel="the helmet"
              revealLabel="Who's behind the helmet?"
              hint="Every warrior has a face. Click to unmask."
              alt="Portrait of Mayank Sharma"
            >
              <div className="flex items-center gap-1.5 text-sm text-fg">
                <FiMapPin className="text-signal" /> {personalData.location}
              </div>
              <div className="mt-1 font-mono text-xs text-fg-muted">
                IST · <LocalTime />
              </div>
            </DotPortrait>
          </Tilt>
        </Reveal>

        {/* Now */}
        <Reveal className="md:col-span-3">
          <Spotlight className="h-full p-7">
            <div className="mb-6 flex items-center justify-between">
              <div className="eyebrow">Right now</div>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-ok">
                <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" /> shipping
              </span>
            </div>
            <div className="text-fg">{now.role}</div>
            <a href={now.url} target="_blank" rel="noreferrer" className="link-underline text-fg-muted">
              {now.company}
            </a>
            <ul className="mt-6 space-y-3">
              {now.products.map((p) => (
                <li key={p.name} className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-fg">{p.name}</div>
                    <div className="text-xs text-fg-muted">{p.kind}</div>
                  </div>
                  <span className="chip shrink-0">{p.region}</span>
                </li>
              ))}
            </ul>
          </Spotlight>
        </Reveal>

        {/* Stats */}
        <Reveal delay={80} className="md:col-span-3">
          <div className="grid h-full grid-cols-2 gap-4">
            {stats.map((s) => (
              <Spotlight key={s.label} className="flex flex-col justify-between p-6">
                <div className="text-4xl font-medium tracking-tight text-fg md:text-5xl">
                  <CountUp value={s.value} />
                </div>
                <div className="mt-6 text-sm text-fg-muted">{s.label}</div>
              </Spotlight>
            ))}
          </div>
        </Reveal>

        {/* Research */}
        <Reveal className="md:col-span-2">
          <a href={research.url} target="_blank" rel="noreferrer" className="group block h-full">
            <Spotlight className="flex h-full flex-col p-7 transition-colors group-hover:border-white/15">
              <div className="mb-6 flex items-center justify-between">
                <div className="eyebrow flex items-center gap-2">
                  <FiBookOpen /> Published
                </div>
                <FiArrowUpRight className="text-fg-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
              </div>
              <div className="font-serif text-2xl italic leading-snug text-fg">&ldquo;{research.title}&rdquo;</div>
              <div className="mt-auto pt-6 font-mono text-[11px] text-fg-muted">{research.venue}</div>
            </Spotlight>
          </a>
        </Reveal>

        {/* Marquee */}
        <Reveal delay={80} className="md:col-span-4">
          <div className="card flex h-full flex-col justify-between py-7">
            <div className="eyebrow px-7">AI toolkit &amp; daily drivers</div>
            <div className="mask-fade-x mt-8 overflow-hidden">
              {/* Trailing margin (not flex gap) so the -50% loop lands exactly on the copy — no seam jump. */}
              <div className="flex w-max animate-marquee">
                {[...marquee, ...marquee].map((t, i) => (
                  <span
                    key={i}
                    aria-hidden={i >= marquee.length || undefined}
                    className="mr-3 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.02] py-2 pl-3 pr-4 text-sm text-fg-muted"
                  >
                    <TechIcon name={t.icon} className="h-4 w-4 shrink-0" />
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
