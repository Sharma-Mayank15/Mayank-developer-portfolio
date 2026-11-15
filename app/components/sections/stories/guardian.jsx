import { mono, Tag } from "./shared";

/* Guardian Lens: one CCTV frame, five layers. Illustrations use viewBox 400×250. */

const W1 = { x: 78, y: 118, s: 1.15 }; // compliant worker
const W2 = { x: 286, y: 126, s: 1.05 }; // worker without a helmet, inside zone B

function Person({ x, y, s: k = 1, outline, opacity = 1, helmet }) {
  const paint = outline
    ? { fill: "none", stroke: "#ededef", strokeOpacity: 0.75, strokeWidth: 1 }
    : { fill: "#2a2d35" };
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={opacity} {...paint}>
      <circle cx="12" cy="8" r="7" />
      <rect x="2" y="17" width="20" height="30" rx="7" />
      <rect x="4" y="44" width="7" height="22" rx="3" />
      <rect x="13" y="44" width="7" height="22" rx="3" />
      {helmet && !outline && <path d="M4.5 7 a7.5 7.5 0 0 1 15 0 h2 v2 h-19 v-2 z" fill="#8b8e98" />}
    </g>
  );
}

function Box({ x, y, w, h, color, label }) {
  const lw = label.length * 5.45 + 8;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} fillOpacity="0.06" stroke={color} strokeWidth="1.4" rx="2" />
      {[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.8" fill={color} />
      ))}
      <rect x={x} y={y - 14} width={lw} height="13" fill={color} rx="1.5" />
      <text x={x + 4} y={y - 4.3} fontSize="9" fill="#07080a" fontWeight="600" style={mono}>
        {label}
      </text>
    </g>
  );
}

/* 1: raw camera frame */
function SceneLayer({ uid, hud = true }) {
  return (
    <svg viewBox="0 0 400 250" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1115" />
          <stop offset="1" stopColor="#191c23" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#${uid}-floor)`} />
      {[-200, -120, -40, 40, 120, 200, 280, 360, 440, 520, 600].map((x) => (
        <line key={x} x1="200" y1="70" x2={x} y2="250" stroke="#fff" strokeOpacity="0.05" />
      ))}
      {[90, 115, 148, 192].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#fff" strokeOpacity="0.05" />
      ))}
      <rect width="400" height="70" fill="#0b0c0f" />
      <rect x="24" y="24" width="90" height="46" fill="#13151a" stroke="#22252c" />
      <path d="M24 40 H114 M24 55 H114 M54 24 V70 M84 24 V70" stroke="#22252c" />
      <rect x="290" y="24" width="90" height="46" fill="#13151a" stroke="#22252c" />
      <path d="M290 40 H380 M290 55 H380 M320 24 V70 M350 24 V70" stroke="#22252c" />

      <Person {...W1} helmet />
      <rect x="83" y="139" width="19" height="22" fill="#3ddc97" opacity="0.2" rx="3" />
      <Person {...W2} />

      <g style={mono} fontSize="7.5" display={hud ? undefined : "none"}>
        <circle cx="14" cy="13" r="3" fill="#ff3b3b" />
        <text x="22" y="15.6" fill="#ededef">REC · CAM-03 · LOADING BAY</text>
        <text x="388" y="15.6" fill="#9a9ca5" textAnchor="end">RTSP stream · 24 FPS</text>
        <path d="M8 232 V238 H14 M392 232 V238 H386" stroke="#ededef" strokeOpacity="0.35" fill="none" />
      </g>
    </svg>
  );
}

/* 2: OpenCV preprocessing, grid + edge outlines */
function PreprocessLayer() {
  const cols = Array.from({ length: 15 }, (_, i) => (i + 1) * 25);
  const rows = Array.from({ length: 9 }, (_, i) => (i + 1) * 25);
  return (
    <svg viewBox="0 0 400 250" aria-hidden="true" focusable="false">
      <g stroke="#fff" strokeOpacity="0.07">
        {cols.map((x) => <line key={`c${x}`} x1={x} y1="0" x2={x} y2="250" />)}
        {rows.map((y) => <line key={`r${y}`} x1="0" y1={y} x2="400" y2={y} />)}
      </g>
      <g fill="none" stroke="#ededef" strokeOpacity="0.4" strokeDasharray="3 3">
        <rect x="24" y="24" width="90" height="46" />
        <rect x="290" y="24" width="90" height="46" />
        <path d="M0 70 H400" />
      </g>
      <Person {...W1} outline />
      <Person {...W2} outline />
      {/* resize target */}
      <rect x="52" y="86" width="296" height="126" fill="none" stroke="#ededef" strokeOpacity="0.55" strokeDasharray="6 4" rx="2" />
      <path d="M52 96 V86 H62 M338 86 H348 V96 M52 202 V212 H62 M338 212 H348 V202" fill="none" stroke="#ededef" strokeWidth="1.6" />
      <Tag>OPENCV · PREPROCESS</Tag>
      <Tag x={388} anchor="end">640 × 640 · RGB</Tag>
      <text x="12" y="238" fontSize="9" fill="#ededef" style={mono}>decode · resize · normalize</text>
      <g fill="#ededef" opacity="0.45">
        {[5, 9, 14, 11, 17, 13, 8, 12, 6, 4].map((h, i) => (
          <rect key={i} x={330 + i * 6} y={240 - h} width="4" height={h} />
        ))}
      </g>
    </svg>
  );
}

/* 3: YOLO detections */
function DetectLayer() {
  return (
    <svg viewBox="0 0 400 250" aria-hidden="true" focusable="false">
      <Person {...W1} opacity="0.55" />
      <Person {...W2} opacity="0.55" />
      <Box x={72} y={106} w={40} h={94} color="#3ddc97" label="person · ppe ok 0.96" />
      <Box x={280} y={115} w={37} h={84} color="#ff6b2c" label="no_helmet 0.91" />
      <circle cx="298.6" cy="134.4" r="11" fill="none" stroke="#ff6b2c" strokeOpacity="0.7" strokeDasharray="2 3" />
      <Tag>YOLO · ONNX RUNTIME</Tag>
      <Tag x={388} anchor="end">2 DETECTIONS</Tag>
    </svg>
  );
}

/* 4: deterministic safety rules */
function RulesLayer({ uid }) {
  return (
    <svg viewBox="0 0 400 250" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ff6b2c" strokeWidth="1" opacity="0.4" />
        </pattern>
      </defs>
      <polygon points="262,150 380,150 400,250 248,250" fill={`url(#${uid}-hatch)`} stroke="#ff6b2c" strokeOpacity="0.75" strokeDasharray="4 3" />
      <text x="328" y="165" fontSize="7.5" fill="#ff8a55" style={mono}>ZONE B</text>
      <text x="328" y="175" fontSize="7.5" fill="#ff8a55" style={mono}>RESTRICTED</text>
      <circle cx="298.6" cy="196" r="3" fill="#ff6b2c" />
      <circle cx="298.6" cy="196" r="8" fill="none" stroke="#ff6b2c" strokeOpacity="0.5" />
      <rect x="12" y="27" width="208" height="21" rx="4" fill="#111216" stroke="#ff6b2c" strokeOpacity="0.45" />
      <text x="19" y="40.6" fontSize="8.5" fill="#ededef" style={mono}>
        if no_helmet AND zone == B → <tspan fill="#ff8a55">violation</tspan>
      </text>
      <Tag y={8}>SAFETY RULES · DETERMINISTIC</Tag>
    </svg>
  );
}

/* 5: human review, then the dashboard */
function ReviewLayer() {
  return (
    <svg viewBox="0 0 400 250" aria-hidden="true" focusable="false">
      <rect x="228" y="27" width="160" height="64" rx="7" fill="#16181d" stroke="#ff6b2c" strokeOpacity="0.55" />
      <circle cx="240" cy="42" r="3" fill="#ff6b2c" />
      <text x="248" y="45.2" fontSize="9" fill="#ededef" fontWeight="600" style={{ fontFamily: "var(--font-sans)" }}>PPE violation · Zone B</text>
      <text x="237" y="58.5" fontSize="7" fill="#9a9ca5" style={mono}>CAM-03 · awaiting human review</text>
      <rect x="237" y="66" width="66" height="17" rx="8.5" fill="#3ddc97" fillOpacity="0.14" stroke="#3ddc97" strokeOpacity="0.7" />
      <text x="270" y="77.5" fontSize="8" fill="#3ddc97" textAnchor="middle" style={mono}>✓ Approve</text>
      <rect x="309" y="66" width="56" height="17" rx="8.5" fill="#fff" fillOpacity="0.04" stroke="#fff" strokeOpacity="0.2" />
      <text x="337" y="77.5" fontSize="8" fill="#9a9ca5" textAnchor="middle" style={mono}>Dismiss</text>

      <rect x="12" y="213" width="192" height="25" rx="6" fill="#16181d" stroke="#fff" strokeOpacity="0.12" />
      <circle cx="24" cy="225.5" r="3" fill="#3ddc97" />
      <text x="33" y="228.5" fontSize="8.5" fill="#ededef" style={mono}>logged to PostgreSQL via FastAPI</text>
    </svg>
  );
}

const guardian = {
  id: "story-guardian-lens",
  ariaLabel: "How Guardian Lens works",
  eyebrow: "Inside Guardian Lens",
  heading: (
    <>
      One frame, five layers of <span className="font-serif italic font-normal text-signal">judgement.</span>
    </>
  ),
  steps: [
    {
      label: "RTSP stream",
      title: "A camera frame arrives",
      body: "It starts with the CCTV and IP cameras already on site. Their live RTSP streams are read frame by frame on a machine at the edge, next to the cameras.",
      Layer: SceneLayer,
    },
    {
      label: "OpenCV",
      title: "OpenCV cleans it up",
      body: "Each frame is decoded, resized and normalised, so the model always sees the same clean input whichever camera it came from.",
      Layer: PreprocessLayer,
      inResult: false, // preprocessing is not part of the finished frame
    },
    {
      label: "YOLO · ONNX Runtime",
      title: "YOLO finds people and PPE",
      body: "Locally trained YOLO models pick out each person and their protective gear. They run at the edge on ONNX Runtime, and every detection carries a confidence score.",
      Layer: DetectLayer,
      backdrop: true,
    },
    {
      label: "Safety rules",
      title: "Rules decide what counts",
      body: "A detection is not a violation yet. Deterministic rules, such as no helmet inside restricted Zone B, make that call, so every alert can be explained.",
      Layer: RulesLayer,
      backdrop: true,
    },
    {
      label: "Review → Dashboard",
      title: "A person has the final say",
      body: "A reviewer approves or dismisses each flagged event before anything is recorded. Verified violations are logged to PostgreSQL through FastAPI and appear on the dashboard.",
      Layer: ReviewLayer,
      backdrop: true,
    },
  ],
  Backdrop: (props) => <SceneLayer {...props} hud={false} />,
  closing: {
    kicker: "● verified · logged",
    line: "The model proposes, the rules decide, a person confirms.",
    href: "#project-guardian-lens", // the details panel in projects.jsx (id = `project-${project.id}`)
    linkLabel: "See the project ↓",
  },
  // view + timeline: engine defaults (450vh, landscape 8:5, object on the right, tilt 54° / −32°)
};

export default guardian;
