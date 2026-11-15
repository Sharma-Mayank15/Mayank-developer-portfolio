import { fadeOnCollapse, mono, sans, Tag } from "./shared";

/* IntelliTraffic: one junction seen from above, five layers. Illustrations use viewBox 300×300 (square).
   Roads are 52 wide and cross at (150,150). Left-hand traffic. Queue counts are illustrative. */

const VB = "0 0 300 300";
const SIGNAL = "#ff6b2c";
const OK = "#3ddc97";
const RED = "#ff3b3b";

// Cars waiting on each approach (top-left corner of each car).
const QUEUES = {
  N: [[158, 103], [158, 84]], // southbound
  S: [[132, 182]], // northbound
  W: [[103, 132], [84, 132], [65, 132], [46, 132], [27, 132]], // eastbound
  E: [[182, 158], [201, 158], [220, 158], [239, 158]], // westbound
};
const vertical = (k) => k === "N" || k === "S";

function Cars({ outline }) {
  return Object.entries(QUEUES).map(([k, cars]) =>
    cars.map(([x, y], i) => (
      <rect
        key={k + i}
        x={x}
        y={y}
        width={vertical(k) ? 10 : 15}
        height={vertical(k) ? 15 : 10}
        rx="2.5"
        {...(outline
          ? { fill: "none", stroke: "#ededef", strokeOpacity: 0.7 }
          : { fill: vertical(k) ? "#ededef" : "#ff8a55" })}
      />
    ))
  );
}

// The signal head at each corner of the junction, named by the approach it controls.
const LIGHTS = { W: [116, 116], N: [184, 116], E: [184, 184], S: [116, 184] };

function Lights({ green }) {
  return Object.entries(LIGHTS).map(([k, [x, y]]) => {
    const on = green.includes(k);
    return (
      <g key={k}>
        <rect x={x - 5} y={y - 5} width="10" height="10" rx="3" fill="#0b0c0f" stroke="#2a2d35" />
        <circle cx={x} cy={y} r="2.7" fill={on ? OK : RED} />
      </g>
    );
  });
}

const RoadGhost = () => (
  <path
    d="M124 0 V124 H0 M176 0 V124 H300 M124 300 V176 H0 M176 300 V176 H300"
    fill="none"
    stroke="#fff"
    strokeOpacity="0.26"
    strokeDasharray="3 3"
  />
);

function Block({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="108" height="108" rx="6" fill="#111317" stroke="#1b1e24" />
      <g fill="#15171c" stroke="#1f2228">
        <rect x="12" y="28" width="38" height="28" rx="2" />
        <rect x="58" y="28" width="38" height="44" rx="2" />
        <rect x="12" y="64" width="38" height="32" rx="2" />
        <rect x="58" y="80" width="38" height="16" rx="2" />
      </g>
    </g>
  );
}

/* 1: the SUMO simulation */
function SimLayer({ hud = true }) {
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <rect width="300" height="300" fill="#0d0e11" />
      <Block x={8} y={8} />
      <Block x={184} y={8} />
      <Block x={8} y={184} />
      <Block x={184} y={184} />

      <rect x="124" width="52" height="300" fill="#181a1f" />
      <rect y="124" width="300" height="52" fill="#181a1f" />
      <g stroke="#fff" strokeOpacity="0.16" strokeDasharray="6 6">
        <path d="M150 0 V124 M150 176 V300 M0 150 H124 M176 150 H300" />
      </g>
      {/* stop lines */}
      <path d="M150 121 H176 M124 179 H150 M121 124 V150 M179 150 V176" stroke="#ededef" strokeOpacity="0.5" strokeWidth="1.5" />

      <Cars />
      <Lights green={["N", "S"]} />

      <g style={mono} fontSize="7" display={hud ? undefined : "none"}>
        <text x="16" y="24" fill="#9a9ca5">SUMO · step 4,812</text>
        <text x="284" y="24" fill="#62656e" textAnchor="end">phase · NS green</text>
      </g>
    </svg>
  );
}

/* 2: state, the queue length on each approach, read through TraCI */
function StateLayer() {
  const strips = [
    { k: "W", n: 5, r: [24, 127, 97, 20], tab: [24, 112] },
    { k: "E", n: 4, r: [179, 153, 78, 20], tab: [227, 176] },
    { k: "N", n: 2, r: [153, 81, 20, 40], tab: [176, 81] },
    { k: "S", n: 1, r: [127, 179, 20, 21], tab: [94, 188] },
  ];
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <RoadGhost />
      {strips.map(({ k, n, r: [x, y, w, h], tab: [tx, ty] }) => (
        <g key={k}>
          <rect x={x} y={y} width={w} height={h} rx="3" fill={SIGNAL} fillOpacity={0.08 + n * 0.07} stroke={SIGNAL} strokeWidth="1.2" />
          <rect x={tx} y={ty} width="30" height="12" rx="1.5" fill={SIGNAL} />
          <text x={tx + 15} y={ty + 9} fontSize="8" fill="#07080a" fontWeight="600" textAnchor="middle" style={mono}>
            {k} · {n}
          </text>
        </g>
      ))}
      <Cars outline />

      <rect x="10" y="204" width="104" height="44" rx="6" fill="#111216" stroke={SIGNAL} strokeOpacity="0.45" />
      <text x="19" y="222" fontSize="9" fill="#ededef" style={mono}>s = [2, 1, 4, 5]</text>
      <text x="19" y="237" fontSize="6.5" fill="#9a9ca5" style={mono}>queued cars · N S E W</text>

      <Tag>STATE · TRACI</Tag>
      <Tag x={288} anchor="end">QUEUE / LANE</Tag>
    </svg>
  );
}

/* 3: the DQN, state in, one Q-value per action out */
function NetworkLayer() {
  const inputs = ["N", "S", "E", "W"].map((k, i) => ({ k, x: 44, y: 96 + i * 36 }));
  const hidden = (x) => Array.from({ length: 5 }, (_, i) => ({ x, y: 78 + i * 36 }));
  const h1 = hidden(104);
  const h2 = hidden(164);
  const out = [{ x: 218, y: 126 }, { x: 218, y: 174 }];
  const pairs = (a, b) => a.flatMap((p) => b.map((q) => [p, q]));
  const edges = [...pairs(inputs, h1), ...pairs(h1, h2), ...pairs(h2, out)];
  // the strongest path: the long E and W queues push the "switch" action
  const hot = [
    [inputs[3], h1[3]], [h1[3], h2[2]], [h2[2], out[1]],
    [inputs[2], h1[2]], [h1[2], h2[3]], [h2[3], out[1]],
  ];
  const hotNodes = new Set([h1[2], h1[3], h2[2], h2[3]]);
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <g stroke="#fff" strokeOpacity="0.1">
        {edges.map(([a, b], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />)}
      </g>
      <g stroke={SIGNAL} strokeOpacity="0.75" strokeWidth="1.2">
        {hot.map(([a, b], i) => <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />)}
      </g>

      {inputs.map(({ k, x, y }) => (
        <g key={k}>
          <circle cx={x} cy={y} r="9" fill="#16181d" stroke={k === "E" || k === "W" ? SIGNAL : "#3a3d45"} />
          <text x={x} y={y + 2.8} fontSize="8" fill="#ededef" textAnchor="middle" style={mono}>{k}</text>
        </g>
      ))}
      {[...h1, ...h2].map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="6" fill="#16181d" stroke={hotNodes.has(n) ? SIGNAL : "#3a3d45"} />
      ))}
      <circle cx={out[0].x} cy={out[0].y} r="7" fill="#16181d" stroke="#3a3d45" />
      <circle cx={out[1].x} cy={out[1].y} r="7" fill={SIGNAL} />
      <circle cx={out[1].x} cy={out[1].y} r="11" fill="none" stroke={SIGNAL} strokeOpacity="0.45" />

      <g style={mono} fontSize="7.5">
        <text x="234" y="124" fill="#9a9ca5">Q(keep)</text>
        <rect x="234" y="129" width="20" height="5" rx="2" fill="#3a3d45" />
        <text x="234" y="172" fill="#ededef">Q(switch)</text>
        <rect x="234" y="177" width="54" height="5" rx="2" fill={SIGNAL} />
        <text x="234" y="195" fontSize="6.5" fill="#ff8a55">↑ argmax</text>
      </g>
      <g style={mono} fontSize="6.5" fill="#62656e" textAnchor="middle" letterSpacing="0.6">
        <text x="44" y="252">STATE</text>
        <text x="134" y="252">HIDDEN</text>
        <text x="218" y="252">ACTIONS</text>
      </g>

      <Tag>DQN · KERAS</Tag>
      <Tag x={288} anchor="end">STATE → Q-VALUES</Tag>
      <text x="12" y="286" fontSize="9" fill="#ededef" style={mono}>one Q-value per action</text>
    </svg>
  );
}

/* 4: the action (switch the phase) and the reward that grades it */
function ActionLayer() {
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <g className={fadeOnCollapse}>
        <RoadGhost />
        <Tag>ACTION → REWARD</Tag>
      </g>

      {/* east–west now has green */}
      <rect x="124" y="125" width="52" height="50" fill={OK} fillOpacity="0.09" />
      <g fill="none" stroke={OK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M122 137 H196 M190 132.5 L196 137 L190 141.5" />
        <path d="M178 163 H104 M110 158.5 L104 163 L110 167.5" />
      </g>
      <path d="M150 121 H176 M124 179 H150" stroke={RED} strokeWidth="2.2" />
      <Lights green={["E", "W"]} />
      <circle cx="116" cy="116" r="7.5" fill="none" stroke={OK} strokeOpacity="0.5" />
      <circle cx="184" cy="184" r="7.5" fill="none" stroke={OK} strokeOpacity="0.5" />

      <rect x="10" y="198" width="104" height="22" rx="5" fill="#111216" stroke={SIGNAL} strokeOpacity="0.5" />
      <text x="18" y="212" fontSize="7.5" fill="#ededef" style={mono}>
        a = switch <tspan fill="#ff8a55">NS → EW</tspan>
      </text>
      <rect x="10" y="226" width="104" height="36" rx="5" fill="#111216" stroke={OK} strokeOpacity="0.45" />
      <text x="18" y="241" fontSize="7.5" fill={OK} style={mono}>r = −Δ wait time</text>
      <text x="18" y="254" fontSize="6" fill="#9a9ca5" style={mono}>less wait → more reward</text>
    </svg>
  );
}

/* 5: the result, fixed-time signals vs the trained agent */
function ResultLayer() {
  return (
    <svg viewBox={VB} aria-hidden="true" focusable="false">
      <Tag>RESULT · FIXED-TIME VS DQN</Tag>

      <rect x="184" y="8" width="108" height="108" rx="8" fill="#111216" stroke="#2a2d35" />
      <g style={mono} fontSize="6.5">
        <text x="193" y="25" fill="#62656e">AVG WAIT / VEHICLE</text>
        <text x="193" y="40" fill="#9a9ca5">fixed-time</text>
        <rect x="193" y="44" width="90" height="6" rx="2" fill="#3a3d45" />
        <text x="193" y="62" fill="#9a9ca5">dqn agent</text>
        <rect x="193" y="66" width="58.5" height="6" rx="2" fill={SIGNAL} />
      </g>
      <text x="192" y="104" fontSize="22" fill="#ededef" fontWeight="600" letterSpacing="-1" style={sans}>−35%</text>

      <rect x="184" y="184" width="108" height="108" rx="8" fill="#111216" stroke="#2a2d35" />
      <text x="193" y="201" fontSize="6.5" fill="#62656e" style={mono}>EPISODE REWARD</text>
      <polyline
        points="193,262 203,256 213,259 223,246 233,249 243,236 253,229 263,224 273,219 283,214"
        fill="none"
        stroke={OK}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="283" cy="214" r="2.2" fill={OK} />
      <line x1="193" y1="268" x2="283" y2="268" stroke="#2a2d35" />
      <text x="193" y="281" fontSize="6.5" fill="#9a9ca5" style={mono}>+28% faster convergence</text>
    </svg>
  );
}

const traffic = {
  id: "story-intellitraffic",
  ariaLabel: "How IntelliTraffic works",
  eyebrow: "Inside IntelliTraffic",
  heading: (
    <>
      One junction that learns to <span className="font-serif italic font-normal text-signal">switch.</span>
    </>
  ),
  steps: [
    {
      label: "SUMO simulation",
      title: "A junction in simulation",
      body: "Training happens in SUMO, a traffic simulator: one four-way junction, cars arriving on every approach, and queues building behind a red light.",
      Layer: SimLayer,
    },
    {
      label: "State · TraCI",
      title: "The agent reads the queues",
      body: "At every step the agent reads the queue length on each lane through TraCI. Those numbers are its state, everything it knows about the road.",
      Layer: StateLayer,
      inResult: false,
      backdrop: true,
    },
    {
      label: "DQN · Keras",
      title: "A network scores each move",
      body: "A Deep Q-Network built in Keras takes that state and estimates a Q-value for each action: how much waiting it expects to save by holding the phase or switching.",
      Layer: NetworkLayer,
      inResult: false,
    },
    {
      label: "Action → reward",
      title: "It switches, then gets graded",
      body: "The agent takes the highest-value action, here switching green from north–south to east–west. The reward then reports whether waiting went down. That is what it learns from.",
      Layer: ActionLayer,
      backdrop: true,
    },
    {
      label: "Fixed-time vs DQN",
      title: "It beats the timetable",
      body: "Against fixed-time signals, the trained agent cuts simulated vehicle wait time by 35%. Custom reward tuning made training converge 28% faster.",
      Layer: ResultLayer,
      backdrop: true,
    },
  ],
  Backdrop: (props) => <SimLayer {...props} hud={false} />,
  closing: {
    kicker: "● trained · benchmarked",
    line: "No fixed timetable. The signal learns from the queue in front of it.",
    href: "#project-intellitraffic", // the details panel in projects.jsx (id = `project-${project.id}`)
    linkLabel: "See the project ↓",
  },
  view: {
    length: "350vh",
    lengthMobile: "300vh",
    shape: "square",
    aspect: "1 / 1",
    tiltX: 57,
    tiltZ: -45, // a true isometric diamond, unlike the other two
    labelCorner: [1, 1],
    staticMaxWidth: 340,
  },
};

export default traffic;
