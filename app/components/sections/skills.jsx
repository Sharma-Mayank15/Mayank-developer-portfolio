import { FiArrowUpRight, FiAward } from "react-icons/fi";
import { education } from "@/utils/data/experience";
import { personalData } from "@/utils/data/personal-data";
import { certifications, skillGroups } from "@/utils/data/skills";
import { Reveal, SectionHeading, Spotlight } from "../ui";

export default function Skills() {
  return (
    <section id="skills" className="container-page py-24 md:py-32">
      <SectionHeading index="04" label="Stack & credentials" title={<>AI first, full stack — and the <span className="font-serif italic text-fg-muted">paper trail</span>.</>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 60}>
            <Spotlight className="h-full p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium text-fg">{g.title}</h3>
                <span className="font-mono text-[11px] text-fg-dim">{String(g.items.length).padStart(2, "0")}</span>
              </div>
              <p className="mt-1 text-xs text-fg-dim">{g.note}</p>
              <ul className="mt-6 space-y-2">
                {g.items.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm text-fg-muted">
                    <span className="h-px w-3 bg-white/20" />
                    {s}
                  </li>
                ))}
              </ul>
            </Spotlight>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Spotlight className="h-full p-7">
            <div className="mb-6 flex items-center justify-between">
              <div className="eyebrow flex items-center gap-2">
                <FiAward /> Certifications
              </div>
              <a href={personalData.certificationsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-[11px] text-fg-muted hover:text-signal">
                verify <FiArrowUpRight />
              </a>
            </div>
            <dl className="divide-y divide-white/[0.06]">
              {certifications.map((c) => (
                <div key={c.issuer} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="text-sm font-medium text-fg">{c.issuer}</dt>
                  <dd className="text-sm text-fg-muted">{c.items}</dd>
                </div>
              ))}
            </dl>
          </Spotlight>
        </Reveal>

        <Reveal delay={80}>
          <Spotlight className="h-full p-7">
            <div className="eyebrow mb-6">Education</div>
            <ol className="relative space-y-7 border-l border-white/10 pl-5">
              {education.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[1.42rem] top-1.5 h-2 w-2 rounded-full border border-signal bg-ink-900" />
                  <div className="font-mono text-[11px] text-fg-dim">{e.duration}</div>
                  <div className="mt-1 font-medium text-fg">{e.title}</div>
                  <div className="text-sm text-fg-muted">{e.institution}</div>
                  {e.detail && <div className="mt-1 font-mono text-[11px] text-fg-muted">{e.detail}</div>}
                </li>
              ))}
            </ol>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}
