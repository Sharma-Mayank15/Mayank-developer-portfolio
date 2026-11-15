import { FiArrowUpRight } from "react-icons/fi";
import { experiences } from "@/utils/data/experience";
import { Reveal, SectionHeading, Spotlight } from "../ui";

export default function Experience() {
  return (
    <section id="experience" className="container-page py-24 md:py-32">
      <SectionHeading index="03" label="Experience" title={<>Shipping production software for clients in the <span className="font-serif italic text-fg-muted">US &amp; Europe</span>.</>} />

      {experiences.map((job) => (
        <div key={job.id} className="grid gap-10 md:grid-cols-12">
          {/* Left: sticky role card */}
          <div className="md:col-span-4">
            <Reveal className="md:sticky md:top-28">
              <div className="flex items-center gap-2 font-mono text-xs text-fg-muted">
                {job.start} — {job.current ? <span className="text-ok">{job.end}</span> : job.end}
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

          {/* Right: products */}
          <div className="relative space-y-4 md:col-span-8">
            {job.products.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <Spotlight className="p-7 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="eyebrow mb-2">
                        Client product · {p.region}
                      </div>
                      <h4 className="text-xl font-medium text-fg md:text-2xl">{p.name}</h4>
                      <p className="mt-1 text-fg-muted">{p.kind}</p>
                    </div>
                    <span className="font-mono text-xs text-fg-dim">0{i + 1}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-[15px] leading-relaxed text-fg-muted">
                        <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-signal" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
