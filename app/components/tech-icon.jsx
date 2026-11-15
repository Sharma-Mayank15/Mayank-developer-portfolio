import { FiDatabase } from "react-icons/fi";
import {
  SiAmazonaws, SiCplusplus, SiDocker, SiExpress, SiFastapi, SiFlask, SiGit, SiGooglechrome, SiGooglecloud, SiHtml5, SiJavascript, SiKeras, SiMongodb,
  SiMysql, SiNextdotjs, SiNodedotjs, SiOnnx, SiOpenai, SiOpencv, SiOpenjdk, SiPostgresql, SiPython, SiReact, SiRedux, SiSocketdotio, SiTailwindcss, SiTypescript,
  SiVercel, SiYolo,
} from "react-icons/si";

// Brand marks missing from the installed icon set, drawn as simple glyphs.
const Claude = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    {[0, 30, 60, 90, 120, 150].map((r) => (
      <rect key={r} x="11" y="2" width="2" height="20" rx="1" transform={`rotate(${r} 12 12)`} />
    ))}
  </svg>
);
const LangChain = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
    <rect x="2" y="8" width="11" height="8" rx="4" />
    <rect x="11" y="8" width="11" height="8" rx="4" />
  </svg>
);
const Mcp = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5" cy="18" r="2.2" />
    <circle cx="19" cy="18" r="2.2" />
    <path d="M12 7.2V12M12 12l-5.5 4.2M12 12l5.5 4.2" />
  </svg>
);

const ICONS = {
  langchain: [LangChain, "#3ddc97"],
  openai: [SiOpenai, "#ededef"],
  claude: [Claude, "#d97757"],
  mcp: [Mcp, "#ededef"],
  rag: [FiDatabase, "#ff8a55"],
  yolo: [SiYolo, "#00c2ff"],
  onnx: [SiOnnx, "#b8bcc6"],
  opencv: [SiOpencv, "#5c9dff"],
  keras: [SiKeras, "#ff4b4b"],
  python: [SiPython, "#ffd343"],
  fastapi: [SiFastapi, "#12b5a0"],
  react: [SiReact, "#61dafb"],
  typescript: [SiTypescript, "#4a9eed"],
  socketio: [SiSocketdotio, "#ededef"],
  postgres: [SiPostgresql, "#6b9bd8"],
  docker: [SiDocker, "#3b9dee"],
  javascript: [SiJavascript, "#f7df1e"],
  redux: [SiRedux, "#b8bcc6"],
  nextjs: [SiNextdotjs, "#ededef"],
  tailwind: [SiTailwindcss, "#38bdf8"],
  html: [SiHtml5, "#ff7a45"],
  node: [SiNodedotjs, "#6cc24a"],
  express: [SiExpress, "#ededef"],
  flask: [SiFlask, "#ededef"],
  mongodb: [SiMongodb, "#4faa41"],
  mysql: [SiMysql, "#5d9bc9"],
  git: [SiGit, "#f05033"],
  chrome: [SiGooglechrome, "#b8bcc6"],
  vercel: [SiVercel, "#ededef"],
  aws: [SiAmazonaws, "#ff9900"],
  java: [SiOpenjdk, "#ededef"],
  cpp: [SiCplusplus, "#659ad2"],
  gcloud: [SiGooglecloud, "#b8bcc6"],
};

export default function TechIcon({ name, className = "" }) {
  const entry = ICONS[name];
  if (!entry) return null;
  const [Icon, color] = entry;
  return <Icon className={className} style={{ color }} aria-hidden />;
}
