// Pure SVG/CSS illustrations — no images, animate via keyframes in globals.scss.

const mono = { fontFamily: "var(--font-mono)" };

function Person({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#2a2d35">
      <circle cx="12" cy="8" r="7" />
      <rect x="2" y="17" width="20" height="30" rx="7" />
      <rect x="4" y="44" width="7" height="22" rx="3" />
      <rect x="13" y="44" width="7" height="22" rx="3" />
    </g>
  );
}

function Box({ x, y, w, h, color, label, conf }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth="1.2" rx="2" />
      {[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.6" fill={color} />
      ))}
      <rect x={x} y={y - 12} width={label.length * 4.6 + 26} height="11" fill={color} rx="1.5" />
      <text x={x + 3} y={y - 3.6} fontSize="7" fill="#07080a" style={mono}>
        {label} {conf}
      </text>
    </g>
  );
}

export function CctvVisual() {
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full" role="img" aria-label="Simulated CCTV feed with AI safety detections">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ff6b2c" strokeWidth="1" opacity="0.35" />
        </pattern>
        <pattern id="scanlines" width="4" height="3" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" fill="#fff" opacity="0.025" />
        </pattern>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1115" />
          <stop offset="1" stopColor="#171a20" />
        </linearGradient>
      </defs>

      <rect width="400" height="250" fill="url(#floor)" />
      {/* perspective floor */}
      {[-200, -120, -40, 40, 120, 200, 280, 360, 440, 520, 600].map((x) => (
        <line key={x} x1="200" y1="70" x2={x} y2="250" stroke="#fff" strokeOpacity="0.04" />
      ))}
      {[90, 115, 148, 192, 250].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#fff" strokeOpacity="0.04" />
      ))}
      <rect y="0" width="400" height="70" fill="#0b0c0f" />
      {/* shelving */}
      <rect x="24" y="22" width="90" height="48" fill="#13151a" stroke="#1e2128" />
      <rect x="290" y="22" width="90" height="48" fill="#13151a" stroke="#1e2128" />

      {/* restricted zone */}
      <polygon points="262,150 380,150 400,250 248,250" fill="url(#hatch)" stroke="#ff6b2c" strokeOpacity="0.6" strokeDasharray="4 3" />
      <text x="300" y="164" fontSize="7" fill="#ff8a55" style={mono}>ZONE B · RESTRICTED</text>

      {/* compliant worker */}
      <Person x="78" y="118" s="1.15" />
      <rect x="83" y="133" width="21" height="10" fill="#3ddc97" opacity="0.25" rx="2" />
      <Box x="72" y="106" w="40" h="94" color="#3ddc97" label="person · ppe ok" conf="0.96" />

      {/* violating worker — drifts toward the zone */}
      <g className="cv-drift">
        <Person x="196" y="128" s="1.05" />
        <Box x="190" y="117" w="37" h="84" color="#ff6b2c" label="no_helmet" conf="0.91" />
        <circle cx="208.6" cy="136.4" r="10" fill="none" stroke="#ff6b2c" strokeOpacity="0.6" className="cv-pulse" />
      </g>

      <rect width="400" height="250" fill="url(#scanlines)" />
      <rect x="0" width="400" height="1.5" fill="#ff6b2c" opacity="0.35" className="cv-scan" />

      {/* HUD */}
      <g style={mono} fontSize="7.5">
        <circle cx="14" cy="13" r="3" fill="#ff3b3b" className="animate-blink" />
        <text x="22" y="15.5" fill="#ededef">REC · CAM-03 · LOADING BAY</text>
        <text x="386" y="15.5" fill="#9a9ca5" textAnchor="end">YOLO · ONNX · 24 FPS</text>
        <path d="M8 30 V24 H14 M392 30 V24 H386 M8 220 V226 H14 M392 220 V226 H386" stroke="#ededef" strokeOpacity="0.35" fill="none" />
      </g>

      {/* alert toast */}
      <g className="cv-toast">
        <rect x="12" y="218" width="196" height="22" rx="5" fill="#16181d" stroke="#ff6b2c" strokeOpacity="0.5" />
        <circle cx="24" cy="229" r="3" fill="#ff6b2c" />
        <text x="32" y="231.5" fontSize="7.5" fill="#ededef" style={mono}>PPE violation → queued for human review</text>
      </g>
    </svg>
  );
}

function Node({ x, y, w = 92, title, sub, accent }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="34" rx="7" fill="#13151a" stroke={accent ? "#ff6b2c" : "#2a2d35"} strokeOpacity={accent ? 0.7 : 1} />
      <text x={x + 10} y={y + 15} fontSize="8.5" fill="#ededef" fontWeight="500">{title}</text>
      <text x={x + 10} y={y + 26} fontSize="6.5" fill="#9a9ca5" style={mono}>{sub}</text>
    </g>
  );
}

export function RagVisual() {
  const flow = { stroke: "#ff6b2c", strokeOpacity: 0.55, strokeWidth: 1.2, strokeDasharray: "3 5", fill: "none" };
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full" role="img" aria-label="RAG resume screening pipeline diagram" style={{ fontFamily: "var(--font-sans)" }}>
      <rect width="400" height="250" fill="#0c0d10" />
      {[...Array(20)].map((_, i) => (
        <circle key={i} cx={(i % 10) * 40 + 20} cy={Math.floor(i / 10) * 200 + 25} r="0.8" fill="#fff" opacity="0.12" />
      ))}

      <Node x={16} y={28} title="resume.pdf" sub="parse · chunk" />
      <Node x={152} y={28} title="Embeddings" sub="text → vectors" />
      <Node x={288} y={28} title="Vector store" sub="top-k search" />
      <Node x={16} y={108} title="Job description" sub="requirements" />
      <Node x={152} y={108} title="Retriever" sub="evidence per skill" />
      <Node x={288} y={108} title="LLM judge" sub="prompted rubric" accent />

      <path d="M108 45 H152" className="rag-flow" {...flow} />
      <path d="M244 45 H288" className="rag-flow" {...flow} />
      <path d="M334 62 V80 H198 V108" className="rag-flow" {...flow} />
      <path d="M108 125 H152" className="rag-flow" {...flow} />
      <path d="M244 125 H288" className="rag-flow" {...flow} />
      <path d="M334 142 V168" className="rag-flow" {...flow} />

      {/* score card */}
      <g>
        <rect x="16" y="168" width="368" height="66" rx="9" fill="#111216" stroke="#2a2d35" />
        <text x="30" y="188" fontSize="6.5" fill="#62656e" style={mono}>CANDIDATE MATCH</text>
        <text x="30" y="220" fontSize="28" fill="#ededef" fontWeight="600" letterSpacing="-1">92</text>
        <text x="68" y="220" fontSize="9" fill="#9a9ca5">/100</text>
        <rect x="112" y="184" width="1" height="38" fill="#2a2d35" />
        {[
          ["React · TypeScript", 0.94, "#3ddc97"],
          ["REST / FastAPI", 0.86, "#3ddc97"],
          ["Kubernetes", 0.28, "#ff6b2c"],
        ].map(([k, v, c], i) => (
          <g key={k} transform={`translate(126 ${186 + i * 14})`}>
            <text y="6" fontSize="7" fill="#9a9ca5" style={mono}>{k}</text>
            <rect x="92" y="1" width="150" height="5" rx="2.5" fill="#1e2128" />
            <rect x="92" y="1" width={150 * v} height="5" rx="2.5" fill={c} className="rag-bar" style={{ animationDelay: `${i * 150}ms` }} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function TrafficVisual() {
  // intersection centered at (130,125), roads 44px wide
  const nsCars = [82, 60, 38, 16];
  const ewCars = [88, 66, 44, 22];
  const Light = ({ x, y, phase }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="-11" width="10" height="22" rx="3" fill="#0b0c0f" stroke="#2a2d35" />
      <circle cy="-5" r="3" fill="#ff3b3b" className={`tl-red ${phase}`} />
      <circle cy="5" r="3" fill="#3ddc97" className={`tl-green ${phase}`} />
    </g>
  );
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full" role="img" aria-label="DQN-controlled traffic intersection simulation" style={{ fontFamily: "var(--font-mono)" }}>
      <defs>
        <clipPath id="sim">
          <rect width="256" height="250" />
        </clipPath>
      </defs>
      <rect width="400" height="250" fill="#0c0d10" />
      <g clipPath="url(#sim)">
        <rect width="256" height="250" fill="#0f1114" />
        <rect x="108" y="0" width="44" height="250" fill="#181a1f" />
        <rect x="0" y="103" width="256" height="44" fill="#181a1f" />
        <line x1="130" y1="0" x2="130" y2="103" stroke="#fff" strokeOpacity="0.15" strokeDasharray="6 6" />
        <line x1="130" y1="147" x2="130" y2="250" stroke="#fff" strokeOpacity="0.15" strokeDasharray="6 6" />
        <line x1="0" y1="125" x2="108" y2="125" stroke="#fff" strokeOpacity="0.15" strokeDasharray="6 6" />
        <line x1="152" y1="125" x2="256" y2="125" stroke="#fff" strokeOpacity="0.15" strokeDasharray="6 6" />
        <line x1="108" y1="100" x2="130" y2="100" stroke="#ededef" strokeOpacity="0.5" strokeWidth="1.5" />
        <line x1="105" y1="125" x2="105" y2="147" stroke="#ededef" strokeOpacity="0.5" strokeWidth="1.5" />

        {nsCars.map((y, i) => (
          <rect key={`n${i}`} x="114" y={y} width="10" height="15" rx="2.5" fill="#ededef" className="car-ns" />
        ))}
        {ewCars.map((x, i) => (
          <rect key={`e${i}`} x={x} y="131" width="15" height="10" rx="2.5" fill="#ff8a55" className="car-ew" />
        ))}

        <Light x={98} y={88} phase="" />
        <Light x={98} y={160} phase="tl-offset" />
        <text x="10" y="18" fontSize="7" fill="#62656e">SUMO · TraCI · step 4,812</text>
        <text x="10" y="240" fontSize="7" fill="#ff8a55">agent: DQN (ε = 0.05)</text>
      </g>

      {/* results panel */}
      <line x1="256" y1="0" x2="256" y2="250" stroke="#22252c" />
      <text x="272" y="30" fontSize="6.5" fill="#62656e">AVG WAIT / VEHICLE</text>
      {[
        ["fixed-time", 62, "#3a3d45"],
        ["dqn agent", 40, "#ff6b2c"],
      ].map(([k, v, c], i) => (
        <g key={k} transform={`translate(272 ${44 + i * 26})`}>
          <text y="6" fontSize="7" fill="#9a9ca5">{k}</text>
          <rect y="10" width={v * 1.75} height="7" rx="2" fill={c} className="rag-bar" />
          <text x={v * 1.75 + 5} y="17" fontSize="7" fill="#ededef">{v}s</text>
        </g>
      ))}
      <text x="272" y="122" fontSize="22" fill="#ededef" fontWeight="600" style={{ fontFamily: "var(--font-sans)" }} letterSpacing="-1">−35%</text>
      <text x="272" y="146" fontSize="6.5" fill="#62656e">EPISODE REWARD</text>
      <polyline
        points="272,222 284,214 296,218 308,200 320,204 332,186 344,178 356,172 368,166 384,160"
        fill="none"
        stroke="#3ddc97"
        strokeWidth="1.4"
        className="spark"
      />
      <line x1="272" y1="228" x2="386" y2="228" stroke="#22252c" />
      <text x="272" y="240" fontSize="6.5" fill="#9a9ca5">+28% faster convergence</text>
    </svg>
  );
}

export const visuals = { cctv: CctvVisual, rag: RagVisual, traffic: TrafficVisual };
