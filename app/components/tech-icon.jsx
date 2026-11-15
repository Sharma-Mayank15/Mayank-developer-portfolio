import { FiAward, FiDatabase } from "react-icons/fi";
import {
  SiAmazonaws, SiCplusplus, SiGoogle, SiIbm, SiJsonwebtokens, SiOracle, SiStripe, SiDocker, SiExpress, SiFastapi, SiFlask, SiGit, SiGooglechrome, SiGooglecloud, SiHtml5, SiJavascript, SiKeras, SiMongodb,
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

// Anthropic's mark, simplified: a slanted bar beside an "A".
const Anthropic = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M13.800 4h3.400l5.800 16h-3.400zM6.800 4h3.600l5.800 16h-3.500l-1.200-3.400H5.500L4.300 20H1zm.700 9.700h3l-1.500-4.300z" />
  </svg>
);

const ICONS = {
  stripe: [SiStripe, "#8b85ff"],
  jwt: [SiJsonwebtokens, "#ededef"],
  // certificate issuers
  anthropic: [Anthropic, "#d97757"],
  google: [SiGoogle, "#5b9bff"],
  oracle: [SiOracle, "#ff5a4d"],
  ibm: [SiIbm, "#6ea6ff"],
  award: [FiAward, "#ffd343"],
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

// Display names used in the data files → icon key. Anything not listed renders without a logo.
const ALIASES = {
  "react": "react", "typescript": "typescript", "javascript": "javascript", "javascript (es6+)": "javascript",
  "redux": "redux", "redux toolkit": "redux", "rtk query": "redux", "socket.io": "socketio", "next.js": "nextjs",
  "tailwind css": "tailwind", "html5 / css3": "html", "node.js": "node", "express": "express", "fastapi": "fastapi",
  "flask": "flask", "postgresql": "postgres", "mongodb": "mongodb", "mysql": "mysql", "python": "python",
  "yolo": "yolo", "onnx runtime": "onnx", "opencv": "opencv", "keras": "keras", "langchain": "langchain",
  "openai api": "openai", "claude api": "claude", "claude code": "claude", "mcp": "mcp", "docker": "docker",
  "stripe": "stripe", "jwt": "jwt", "git & github": "git", "vercel": "vercel", "java": "java", "c++": "cpp",
  // issuers
  "anthropic academy": "anthropic", "google": "google", "oracle": "oracle", "ibm": "ibm", "nptel · iit kharagpur": "award",
};

/** Icon key for a display name such as "Socket.IO" or "Anthropic Academy", or undefined. */
export const iconFor = (label) => ALIASES[String(label).trim().toLowerCase()];

/** A stack chip that shows the technology's logo when one is available. */
export function TechChip({ label, className = "", style }) {
  const icon = iconFor(label);
  return (
    <span className={`chip ${icon ? "gap-1.5 pl-2" : ""} ${className}`} style={style}>
      {icon && <TechIcon name={icon} className="h-3 w-3 shrink-0" />}
      {label}
    </span>
  );
}

export default function TechIcon({ name, className = "" }) {
  const entry = ICONS[name];
  if (!entry) return null;
  const [Icon, color] = entry;
  return <Icon className={className} style={{ color }} aria-hidden />;
}
