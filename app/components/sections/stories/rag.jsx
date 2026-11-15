import { fadeOnCollapse, mono, sans, Tag } from "./shared";

/* SmartResume: one resume page, five layers. Illustrations use viewBox 320×400 (portrait 4:5).
   The sample candidate is Mayank himself: every line on the page is a fact from his own resume
   (see CLAUDE.md). No phone or email is drawn. The requirement scores are illustrative and match
   RagVisual in project-visuals.jsx. */

const VB = "0 0 320 400";
const SIGNAL = "#ff6b2c";
const OK = "#3ddc97";

// The six blocks of the page. Every layer registers to these, so overlays land on the right text.
const CHUNKS = [
  { id: "01", y: 72, h: 28 }, // summary
  { id: "02", y: 118, h: 40 }, // experience: Ditstek, React JS
  { id: "03", y: 164, h: 40 }, // experience: Guardian Lens
  { id: "04", y: 224, h: 36 }, // projects
  { id: "05", y: 280, h: 28 }, // skills
  { id: "06", y: 328, h: 28 }, // education
];
const box = (c) => ({ x: 16, y: c.y - 2, width: 288, height: c.h + 4 });

const REQUIREMENTS = [
  { name: "React · TypeScript", score: 0.94, ok: true, chunks: ["02", "05"], reason: "Two client products in React + TypeScript." },
  { name: "REST / FastAPI", score: 0.86, ok: true, chunks: ["03", "05"], reason: "FastAPI + PostgreSQL service, Guardian Lens." },
  { name: "Kubernetes", score: 0.28, ok: false, chunks: [], reason: "No evidence in the resume." },
];

const Bar = ({ x = 26, y, w, o = 1 }) => <rect x={x} y={y} width={w} height="3.5" rx="1.75" fill="#2a2d35" opacity={o} />;

const EVIDENCE = {
  "02": "React + TypeScript, Redux, Socket.IO",
  "03": "FastAPI + PostgreSQL service, YOLO, ONNX",
  "04": "Keras DQN agent in SUMO via TraCI",
};

function Evidence({ id, fill = "#9a9ca5" }) {
  const c = CHUNKS.find((k) => k.id === id);
  return (
    <text x="26" y={c.y + 21} fontSize="7.5" fill={fill} style={sans}>
      {EVIDENCE[id]}
    </text>
  );
}

/* 1: the resume page */
function PageLayer({ uid, hud = true }) {
  const skills = ["React", "TypeScript", "FastAPI", "LangChain", "RAG", "YOLO"];
  let sx = 26;
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15171c" />
          <stop offset="1" stopColor="#101216" />
        </linearGradient>
      </defs>
      <rect width="320" height="400" fill={`url(#${uid}-paper)`} />

      <g style={mono} fontSize="7" display={hud ? undefined : "none"}>
        <text x="20" y="16" fill="#9a9ca5">resume.pdf · parsed</text>
        <text x="300" y="16" fill="#62656e" textAnchor="end">PDF → TEXT</text>
      </g>

      {/* header */}
      <text x="20" y="40" fontSize="15" fill="#ededef" fontWeight="600" letterSpacing="-0.3" style={sans}>Mayank Sharma</text>
      <text x="20" y="52" fontSize="7.5" fill="#9a9ca5" style={sans}>AI-focused Software Engineer</text>
      <Bar x={236} y={32} w={64} />
      <Bar x={252} y={40} w={48} />
      <Bar x={244} y={48} w={56} />
      <line x1="20" y1="60" x2="300" y2="60" stroke="#fff" strokeOpacity="0.08" />

      <g style={mono} fontSize="6.5" fill="#62656e" letterSpacing="0.8">
        <text x="20" y="69">SUMMARY</text>
        <text x="20" y="113">EXPERIENCE</text>
        <text x="20" y="219">PROJECTS</text>
        <text x="20" y="275">SKILLS</text>
        <text x="20" y="323">EDUCATION</text>
      </g>

      {/* 01 summary */}
      <Bar y={77} w={262} />
      <Bar y={85} w={240} />
      <Bar y={93} w={176} />

      {/* 02 + 03 experience */}
      <g style={sans}>
        <text x="26" y="128" fontSize="8.5" fill="#ededef" fontWeight="500">Software Engineer, React JS · Ditstek</text>
        <text x="294" y="139" fontSize="7" fill="#62656e" textAnchor="end" style={mono}>2025 to now</text>
        <text x="26" y="174" fontSize="8.5" fill="#ededef" fontWeight="500">Guardian Lens · AI safety platform</text>
        <text x="26" y="234" fontSize="8.5" fill="#ededef" fontWeight="500">IntelliTraffic · deep RL signal control</text>
        <text x="26" y="338" fontSize="8" fill="#9a9ca5">B.E. Computer Science, Chandigarh University</text>
        <text x="294" y="338" fontSize="7" fill="#62656e" textAnchor="end" style={mono}>2021 to 25</text>
      </g>
      <Evidence id="02" />
      <Bar y={145} w={236} />
      <Bar y={152} w={150} />
      <Evidence id="03" />
      <Bar y={191} w={214} />
      <Bar y={198} w={168} />

      {/* 04 projects */}
      <Evidence id="04" />
      <Bar y={251} w={196} />

      {/* 05 skills */}
      {skills.map((k) => {
        const w = k.length * 4 + 10;
        const x = sx;
        sx += w + 5;
        return (
          <g key={k}>
            <rect x={x} y="283" width={w} height="13" rx="6.5" fill="#fff" fillOpacity="0.03" stroke="#fff" strokeOpacity="0.12" />
            <text x={x + w / 2} y="292" fontSize="6.5" fill="#9a9ca5" textAnchor="middle" style={mono}>{k}</text>
          </g>
        );
      })}
      <Bar y={302} w={120} />

      {/* 06 education */}
      <Bar y={346} w={170} />
      <text x="300" y="388" fontSize="6.5" fill="#62656e" textAnchor="end" style={mono}>1 / 1</text>
    </svg>
  );
}

/* 2: chunking + embeddings */
function ChunkLayer() {
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      {CHUNKS.map((c, i) => {
        const b = box(c);
        const cy = c.y + c.h / 2;
        return (
          <g key={c.id}>
            <rect {...b} rx="3" fill="none" stroke="#ededef" strokeOpacity="0.5" strokeDasharray="5 3" />
            <rect x="24" y={b.y - 5} width="42" height="10" rx="2" fill="#16181d" stroke="#ededef" strokeOpacity="0.35" />
            <text x="45" y={b.y + 2.4} fontSize="6.5" fill="#ededef" textAnchor="middle" style={mono}>chunk {c.id}</text>
            {/* the text it holds… */}
            <Bar y={cy - 4} w={96 - (i % 3) * 12} o={0.9} />
            <Bar y={cy + 4} w={70 + (i % 2) * 22} o={0.9} />
            {/* …becomes a vector */}
            <path d={`M148 ${cy} H190 M185 ${cy - 3.5} L190 ${cy} L185 ${cy + 3.5}`} fill="none" stroke="#ededef" strokeOpacity="0.45" />
            {Array.from({ length: 10 }, (_, j) => (
              <rect key={j} x={204 + j * 9.2} y={cy - 4} width="7" height="8" rx="1.5" fill="#ededef" opacity={0.12 + (((i + 2) * 7 + j * (i + 3) * 5) % 10) / 13} />
            ))}
          </g>
        );
      })}
      <Tag>CHUNKS · EMBEDDINGS</Tag>
      <Tag x={308} anchor="end">TEXT → VECTORS</Tag>
      <text x="16" y="386" fontSize="9" fill="#ededef" style={mono}>split · embed · 6 chunks → 6 vectors</text>
    </svg>
  );
}

/* 3: vector-store retrieval, the top-k chunks per requirement light up */
function Lit({ id, label, dashed }) {
  const c = CHUNKS.find((k) => k.id === id);
  const b = box(c);
  const lw = label.length * 4.75 + 10;
  return (
    <g>
      <rect {...b} rx="3" fill={SIGNAL} fillOpacity={dashed ? 0.05 : 0.09} stroke={SIGNAL} strokeWidth="1.3" strokeDasharray={dashed ? "4 3" : undefined} />
      {!dashed &&
        [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.8" fill={SIGNAL} />
        ))}
      <rect x={b.x + b.width - lw} y={b.y} width={lw} height="12" rx="1.5" fill={SIGNAL} />
      <text x={b.x + b.width - lw / 2} y={b.y + 8.8} fontSize="7.5" fill="#07080a" fontWeight="600" textAnchor="middle" style={mono}>
        {label}
      </text>
    </g>
  );
}

function RetrieveLayer() {
  const flow = { fill: "none", stroke: SIGNAL, strokeOpacity: 0.6, strokeWidth: 1.1, strokeDasharray: "3 4" };
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      {/* every chunk in the store, faintly */}
      <g className={fadeOnCollapse}>
        {CHUNKS.map((c) => (
          <rect key={c.id} {...box(c)} rx="3" fill="none" stroke="#fff" strokeOpacity="0.1" />
        ))}
      </g>

      <Lit id="02" label="React · TypeScript" />
      <Evidence id="02" fill="#ededef" />
      <Lit id="03" label="REST / FastAPI" />
      <Evidence id="03" fill="#ededef" />
      <Lit id="05" label="2nd match" dashed />

      {/* the queries: one per job requirement */}
      <g className={fadeOnCollapse}>
        <Tag>VECTOR STORE · TOP-K</Tag>
        <Tag x={308} anchor="end">3 REQUIREMENTS</Tag>
        <g style={mono} fontSize="7.5">
          <rect x="16" y="30" width="96" height="17" rx="8.5" fill="#111216" stroke={SIGNAL} strokeOpacity="0.55" />
          <text x="64" y="41.4" fill="#ededef" textAnchor="middle">React · TypeScript</text>
          <rect x="124" y="30" width="72" height="17" rx="8.5" fill="#111216" stroke="#fff" strokeOpacity="0.22" strokeDasharray="3 3" />
          <text x="160" y="41.4" fill="#9a9ca5" textAnchor="middle">Kubernetes</text>
          <rect x="208" y="30" width="96" height="17" rx="8.5" fill="#111216" stroke={SIGNAL} strokeOpacity="0.55" />
          <text x="256" y="41.4" fill="#ededef" textAnchor="middle">REST / FastAPI</text>
          <text x="160" y="66" fontSize="6.5" fill="#62656e" textAnchor="middle">no match</text>
        </g>
        <path d="M16 38.5 H8 V138 H16" {...flow} />
        <path d="M304 38.5 H312 V184 H304" {...flow} />
        <path d="M160 47 V58" fill="none" stroke="#fff" strokeOpacity="0.3" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

/* 4: the LLM judge scores each requirement against its evidence */
function JudgeLayer() {
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <Tag>LLM JUDGE · PROMPTED RUBRIC</Tag>

      <rect x="16" y="30" width="288" height="56" rx="6" fill="#111216" stroke={SIGNAL} strokeOpacity="0.45" />
      <g style={mono} fontSize="8" fill="#ededef">
        <text x="26" y="46"><tspan fill="#ff8a55">system</tspan>  Score each requirement using</text>
        <text x="26" y="58">        only the retrieved evidence.</text>
        <text x="26" y="74"><tspan fill="#ff8a55">return</tspan>  {"{ score, reason }"}</text>
      </g>

      {REQUIREMENTS.map((r, i) => {
        const y = 100 + i * 76;
        const color = r.ok ? OK : SIGNAL;
        let cx = 70;
        return (
          <g key={r.name}>
            <rect x="16" y={y} width="288" height="66" rx="6" fill="#16181d" stroke="#fff" strokeOpacity="0.1" />
            <text x="28" y={y + 19} fontSize="10" fill="#ededef" fontWeight="600" style={sans}>{r.name}</text>
            <rect x="236" y={y + 8} width="56" height="16" rx="8" fill={color} fillOpacity="0.14" stroke={color} strokeOpacity="0.7" />
            <text x="264" y={y + 19} fontSize="7.5" fill={color} textAnchor="middle" style={mono}>{r.ok ? "✓ match" : "gap"}</text>
            <text x="28" y={y + 37} fontSize="6.5" fill="#62656e" style={mono}>evidence</text>
            {r.chunks.length ? (
              r.chunks.map((id) => {
                const x = cx;
                cx += 46;
                return (
                  <g key={id}>
                    <rect x={x} y={y + 28} width="42" height="12" rx="2" fill={SIGNAL} fillOpacity="0.1" stroke={SIGNAL} strokeOpacity="0.6" />
                    <text x={x + 21} y={y + 36.6} fontSize="6.5" fill="#ff8a55" textAnchor="middle" style={mono}>chunk {id}</text>
                  </g>
                );
              })
            ) : (
              <text x="70" y={y + 37} fontSize="6.5" fill="#9a9ca5" style={mono}>none retrieved</text>
            )}
            <text x="28" y={y + 54} fontSize="8" fill="#9a9ca5" style={sans}>{r.reason}</text>
          </g>
        );
      })}

      <text x="16" y="386" fontSize="9" fill="#ededef" style={mono}>evidence in · score + reason out</text>
    </svg>
  );
}

/* 5: the result, a match score with a bar and a reason per skill */
function ScoreLayer() {
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <Tag>RESULT · SCORE + REASONS</Tag>

      <rect x="14" y="210" width="292" height="178" rx="9" fill="#111216" stroke="#2a2d35" />
      <text x="28" y="231" fontSize="6.5" fill="#62656e" letterSpacing="0.8" style={mono}>CANDIDATE MATCH</text>
      <text x="27" y="266" fontSize="30" fill="#ededef" fontWeight="600" letterSpacing="-1" style={sans}>92</text>
      <text x="66" y="266" fontSize="10" fill="#9a9ca5" style={sans}>/100</text>
      <rect x="214" y="246" width="78" height="18" rx="9" fill={OK} fillOpacity="0.14" stroke={OK} strokeOpacity="0.7" />
      <text x="253" y="258.2" fontSize="7.5" fill={OK} textAnchor="middle" style={mono}>✓ strong match</text>
      <line x1="28" y1="282" x2="292" y2="282" stroke="#2a2d35" />

      {REQUIREMENTS.map((r, i) => {
        const y = 291 + i * 31;
        return (
          <g key={r.name}>
            <text x="28" y={y + 7} fontSize="7.5" fill="#ededef" style={mono}>{r.name}</text>
            <rect x="130" y={y + 1.5} width="162" height="5" rx="2.5" fill="#1e2128" />
            <rect x="130" y={y + 1.5} width={162 * r.score} height="5" rx="2.5" fill={r.ok ? OK : SIGNAL} />
            <text x="28" y={y + 19} fontSize="7.5" fill="#9a9ca5" style={sans}>{r.reason}</text>
          </g>
        );
      })}
    </svg>
  );
}

const rag = {
  id: "story-resume-screener",
  ariaLabel: "How SmartResume works",
  eyebrow: "Inside SmartResume",
  heading: (
    <>
      One resume, read for <span className="font-serif italic font-normal text-signal">evidence.</span>
    </>
  ),
  steps: [
    {
      label: "resume.pdf",
      title: "A resume arrives as a PDF",
      body: "Every application starts as a document. The PDF is parsed into clean text with its sections kept in order, so layout never affects the result.",
      Layer: PageLayer,
    },
    {
      label: "Chunks · embeddings",
      title: "It is split and embedded",
      body: "The text is split into small chunks, and each chunk becomes an embedding: a vector that captures what the passage means, not just the words it uses.",
      Layer: ChunkLayer,
      inResult: false,
    },
    {
      label: "Vector store · top-k",
      title: "Each requirement finds its evidence",
      body: "For each requirement in the job description, the retriever pulls the top-k closest chunks from the vector store. Those passages are the evidence. A missing skill finds none.",
      Layer: RetrieveLayer,
      backdrop: true,
    },
    {
      label: "LLM judge",
      title: "An LLM scores it against a rubric",
      body: "A prompted rubric has the model score each requirement using only the retrieved evidence, and give its reason. It runs on LangChain and the OpenAI API, served by FastAPI.",
      Layer: JudgeLayer,
      inResult: false,
    },
    {
      label: "Score + reasons",
      title: "A score you can question",
      body: "The recruiter sees a match score with a bar and a reason for every skill. The pipeline reaches 90%+ screening accuracy and ships through Dockerized CI/CD.",
      Layer: ScoreLayer,
      backdrop: true,
    },
  ],
  Backdrop: (props) => <PageLayer {...props} hud={false} />,
  closing: {
    kicker: "● scored · explained",
    line: "Every score points back to its evidence. Reasons, not just keywords.",
    href: "#project-resume-screener", // the details panel in projects.jsx (id = `project-${project.id}`)
    linkLabel: "See the project ↓",
  },
  view: {
    length: "350vh",
    lengthMobile: "300vh",
    shape: "portrait",
    aspect: "4 / 5",
    mirror: true, // page on the left, text on the right
    tiltZ: 32,
    gap: 0.27,
    gapMobile: 0.22,
    labelCorner: [-1, 1],
    labelSide: "left",
    staticMaxWidth: 300,
  },
};

export default rag;
