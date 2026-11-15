import { FiArrowUpRight, FiAward } from "react-icons/fi";
import { education } from "@/utils/data/experience";
import { personalData } from "@/utils/data/personal-data";
import { certifications, skillGroups } from "@/utils/data/skills";
import TechIcon, { iconFor } from "../tech-icon";
import { Reveal, SectionHeading, Spotlight } from "../ui";
import SkillField from "./skill-field";

// Skill name → logo key in tech-icon.jsx. Skills without an entry render as a plain chip.
const ICON_FOR = {
  "RAG pipelines": "rag",
  LangChain: "langchain",
  "OpenAI API": "openai",
  "Claude API": "claude",
  "MCP · Agent Skills": "mcp",
  "YOLO · computer vision": "yolo",
  "ONNX Runtime · OpenCV": "onnx",
  "Keras · Deep RL (DQN)": "keras",
  "Vertex AI": "gcloud",
  React: "react",
  TypeScript: "typescript",
  "JavaScript (ES6+)": "javascript",
  "Redux Toolkit": "redux",
  "RTK Query": "redux",
  "Socket.IO": "socketio",
  "Next.js": "nextjs",
  "Tailwind CSS": "tailwind",
  "HTML5 / CSS3": "html",
  "Node.js": "node",
  Express: "express",
  FastAPI: "fastapi",
  Flask: "flask",
  PostgreSQL: "postgres",
  MongoDB: "mongodb",
  MySQL: "mysql",
  "Git & GitHub": "git",
  Docker: "docker",
  "Chrome DevTools": "chrome",
  "Claude Code": "claude",
  Vercel: "vercel",
  "AWS (EC2, S3)": "aws",
  Python: "python",
  Java: "java",
  "C++": "cpp",
};

/** Static, semantic version of the stack: the no-JS / reduced-motion view and the screen-reader source of truth. */
function SkillList() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {skillGroups.map((g, i) => (
        <div key={g.title} className={`card p-6 ${i === 0 ? "lg:col-span-3" : ""}`}>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="flex items-center gap-2.5 font-medium text-fg">
              <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-signal" : "bg-white/40"}`} aria-hidden />
              {g.title}
            </h3>
            <span className="font-mono text-[11px] text-fg-dim" aria-hidden>
              {String(g.items.length).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-1 text-xs text-fg-dim">{g.note}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {g.items.map((s) => (
              <li key={s} className={`chip gap-2 !px-3 !py-1.5 ${i === 0 ? "!border-signal/25 !text-fg" : ""}`}>
                <TechIcon name={ICON_FOR[s]} className="h-3.5 w-3.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="container-page py-24 md:py-32">
      <SectionHeading index="04" label="Stack & credentials" title={<>AI at the core, the full stack in <span className="font-serif italic text-fg-muted">orbit</span>.</>} />

      <Reveal>
        <SkillField groups={skillGroups}>
          <SkillList />
        </SkillField>
      </Reveal>

      <Reveal>
        <div className="mb-4 mt-12 flex items-center justify-between px-1">
          <h3 className="eyebrow flex items-center gap-2">
            <FiAward aria-hidden /> Certifications
          </h3>
          <a href={personalData.certificationsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-[11px] text-fg-muted transition-colors hover:text-signal">
            verify <FiArrowUpRight aria-hidden />
          </a>
        </div>
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c, i) => {
          const items = c.items.split(", ");
          return (
            <Reveal as="li" key={c.issuer} delay={i * 50} className={i === 0 ? "sm:col-span-2" : ""}>
              <Spotlight className="h-full p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-base font-medium text-fg">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04]" aria-hidden>
                      <TechIcon name={iconFor(c.issuer) || "award"} className="h-4 w-4" />
                    </span>
                    {c.issuer}
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-fg-dim" aria-hidden>
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {items.map((it) => (
                    <li key={it} className="chip !rounded-lg">
                      {it}
                    </li>
                  ))}
                </ul>
              </Spotlight>
            </Reveal>
          );
        })}
      </ul>

      <Reveal className="mt-4">
        <Spotlight className="p-5 sm:p-6">
          <h3 className="eyebrow mb-5">Education</h3>
          <ol className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            {education.map((e) => (
              <li key={e.id} className="relative border-l border-white/10 pl-5">
                <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full border border-signal bg-ink-900" aria-hidden />
                <div className="font-mono text-[11px] text-fg-dim">{e.duration}</div>
                <div className="mt-1 font-medium text-fg">{e.title}</div>
                <div className="text-sm text-fg-muted">{e.institution}</div>
                {e.detail && <div className="chip mt-2.5">{e.detail}</div>}
              </li>
            ))}
          </ol>
        </Spotlight>
      </Reveal>
    </section>
  );
}
