import { FiArrowUpRight, FiGithub, FiLock } from "react-icons/fi";
import { featuredProjects, otherProjects } from "@/utils/data/projects-data";
import { Reveal, SectionHeading, Spotlight } from "../ui";
import { visuals } from "./project-visuals";

function FeaturedProject({ project, flip }) {
  const Visual = visuals[project.visual];
  return (
    <Reveal>
      <Spotlight className="grid gap-0 lg:grid-cols-2">
        {/* visual */}
        <div className={`relative flex flex-col justify-center border-b border-white/[0.06] bg-ink-950 p-3 lg:border-b-0 ${flip ? "lg:order-2 lg:border-l" : "lg:border-r"}`}>
          <div className="aspect-[8/5] overflow-hidden rounded-xl border border-white/[0.06]">
            <Visual />
          </div>
          {project.pipeline && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1 pb-1">
              {project.pipeline.map((step, i) => (
                <span key={step} className="flex items-center gap-1.5 font-mono text-[10.5px] text-fg-muted">
                  <span className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1">{step}</span>
                  {i < project.pipeline.length - 1 && <span className="text-signal">→</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* content */}
        <div className="flex flex-col p-7 md:p-10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-signal">{project.index}</span>
            <span className="eyebrow">{project.role}</span>
          </div>
          <h3 className="mt-6 text-3xl font-medium tracking-tight text-fg md:text-4xl">{project.name}</h3>
          <p className="mt-1 font-serif text-xl italic text-fg-muted">{project.subtitle}</p>
          <p className="mt-6 text-pretty leading-relaxed text-fg-muted">{project.description}</p>

          <ul className="mt-6 space-y-2.5">
            {project.points.map((pt) => (
              <li key={pt} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-signal" />
                {pt}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-4 pt-8">
            {project.code ? (
              <a href={project.code} target="_blank" rel="noreferrer" className="btn-ghost">
                <FiGithub /> Source <FiArrowUpRight />
              </a>
            ) : project.privateRepo ? (
              <span className="chip gap-1.5 py-1.5" title="Proprietary company code — available to discuss in interviews">
                <FiLock /> Private company repo
              </span>
            ) : null}
            {project.metric && (
              <div className="ml-auto text-right">
                <div className="text-2xl font-medium tracking-tight text-fg">{project.metric.value}</div>
                <div className="font-mono text-[11px] text-fg-dim">{project.metric.label}</div>
              </div>
            )}
          </div>
        </div>
      </Spotlight>
    </Reveal>
  );
}

export default function Projects() {
  return (
    <section id="work" className="container-page py-24 md:py-32">
      <SectionHeading index="02" label="Selected AI work" title={<>Applied AI, built to run in the <span className="font-serif italic text-fg-muted">real world</span>.</>}>
        Computer vision at the edge, retrieval-augmented LLMs and reinforcement learning — each one taken from idea to
        a working system.
      </SectionHeading>

      <div className="space-y-6">
        {featuredProjects.map((p, i) => (
          <FeaturedProject key={p.id} project={p} flip={i % 2 === 1} />
        ))}
      </div>

      <Reveal className="mt-20">
        <div className="eyebrow mb-4">More builds</div>
        <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {otherProjects.map((p) => (
            <li key={p.name}>
              <a
                href={p.code}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors md:grid-cols-[1.2fr_1.6fr_auto] lg:grid-cols-[1.2fr_1.6fr_auto_auto]"
              >
                <span className="font-medium text-fg transition-colors group-hover:text-signal">{p.name}</span>
                <span className="col-span-2 row-start-2 text-sm text-fg-muted md:col-span-1 md:row-start-auto">{p.description}</span>
                <span className="hidden gap-1.5 lg:flex">
                  {p.stack.slice(0, 3).map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                </span>
                <FiArrowUpRight className="row-start-1 justify-self-end text-fg-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal md:row-start-auto" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
