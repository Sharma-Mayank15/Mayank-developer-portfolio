import { FiArrowUpRight } from "react-icons/fi";
import { experiences } from "@/utils/data/experience";
import { Reveal, SectionHeading } from "../ui";
import { ExperienceTimeline, TimeInRole } from "./experience-timeline";

export default function Experience() {
  return (
    <section id="experience" className="container-page py-24 md:py-32">
      <SectionHeading index="03" label="Experience" title={<>Shipping production software for clients in the <span className="font-serif italic text-fg-muted">US &amp; Europe</span>.</>} />

      {experiences.map((job) => (
        <div key={job.id} className="grid gap-10 md:grid-cols-12">
          {/* Left: sticky role card */}
          <div className="md:col-span-4">
            <Reveal className="md:sticky md:top-28">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-fg-muted">
                {job.start} to {job.current ? <span className="text-ok">{job.end}</span> : job.end}
                {job.current && <TimeInRole start={job.start} />}
              </div>
              <h3 className="mt-3 text-2xl font-medium tracking-tight text-fg">
                <a href={job.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5">
                  {job.company}
                  <FiArrowUpRight className="text-fg-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
                </a>
              </h3>
              <div className="mt-1 text-fg-muted">{job.role}</div>
              <div className="mt-1 text-sm text-fg-dim">
                {job.location} · {job.companyNote}
              </div>
              {job.highlights.map((h) => (
                <p key={h} className="mt-6 border-l border-signal/50 pl-4 text-sm leading-relaxed text-fg-muted">
                  {h}
                </p>
              ))}
            </Reveal>
          </div>

          {/* Right: products on a scroll-driven timeline rail */}
          <div className="min-w-0 md:col-span-8">
            <ExperienceTimeline products={job.products} />
          </div>
        </div>
      ))}
    </section>
  );
}
