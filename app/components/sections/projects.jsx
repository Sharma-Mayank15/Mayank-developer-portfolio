import { Fragment } from "react";
import { FiArrowUpRight, FiGithub, FiLock } from "react-icons/fi";
import { featuredProjects, otherProjects } from "@/utils/data/projects-data";
import { Reveal, SectionHeading, Spotlight } from "../ui";
import ProjectStory from "./stories";

/** Compact facts for one project. The scroll story above it carries the visual. */
function ProjectDetails({ project }) {
  return (
    <Reveal>
      <Spotlight
        as="article"
        id={`project-${project.id}`} // target of the story's closing link (stories/*.jsx → closing.href)
        className="grid gap-8 p-6 md:p-9 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs text-signal">{project.index}</span>
            <span className="eyebrow text-right">{project.role}</span>
          </div>
          <h3 className="mt-5 text-2xl font-medium tracking-tight text-fg md:text-3xl">{project.name}</h3>
          <p className="mt-1 font-serif text-lg italic text-fg-muted">{project.subtitle}</p>

          <div className="mt-auto flex items-end gap-4 pt-7">
            {project.code ? (
              <a href={project.code} target="_blank" rel="noreferrer" className="btn-ghost">
                <FiGithub /> Source <FiArrowUpRight />
              </a>
            ) : project.privateRepo ? (
              <span className="chip gap-1.5 py-1.5" title="Proprietary company code, available to discuss in interviews">
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

        <div className="border-t border-white/[0.06] pt-7 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
          <ul className="space-y-2.5">
            {project.points.map((pt) => (
              <li key={pt} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-signal" />
                {pt}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        </div>
      </Spotlight>
    </Reveal>
  );
}

export default function Projects() {
  return (
    // #work wraps the whole projects area (heading, the pinned stories, their panels, more builds) so the
    // nav highlight holds throughout. It must never get overflow hidden/auto: the stories use position: sticky.
    <section id="work" className="py-24 md:py-32">
      {/* The negative margins below only eat into the empty top/bottom of a story's 100svh stage. */}
      <div className="container-page md:mb-[max(-8svh,-4rem)]">
        <SectionHeading index="02" label="Selected AI work" title={<>Applied AI, built to run in the <span className="font-serif italic text-fg-muted">real world</span>.</>}>
          Computer vision at the edge, retrieval-augmented LLMs and reinforcement learning. Each one taken from idea to
          a working system.
        </SectionHeading>
      </div>

      {featuredProjects.map((p) => (
        <Fragment key={p.id}>
          <ProjectStory visual={p.visual} />
          <div className="container-page relative z-10 mt-[max(-4svh,-2rem)] md:mt-[max(-12svh,-6rem)]">
            <ProjectDetails project={p} />
          </div>
        </Fragment>
      ))}

      <div className="container-page">
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
      </div>
    </section>
  );
}
