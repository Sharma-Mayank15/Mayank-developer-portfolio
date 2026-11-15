"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import s from "./scroll-story.module.scss";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    label: "RTSP stream",
    title: "A camera frame arrives",
    body: "It starts with the CCTV and IP cameras already on site. Their live RTSP streams are read frame by frame on a machine at the edge, next to the cameras.",
  },
  {
    label: "OpenCV",
    title: "OpenCV cleans it up",
    body: "Each frame is decoded, resized and normalised, so the model always sees the same clean input whichever camera it came from.",
  },
  {
    label: "YOLO · ONNX Runtime",
    title: "YOLO finds people and PPE",
    body: "Locally trained YOLO models pick out each person and their protective gear. They run at the edge on ONNX Runtime, and every detection carries a confidence score.",
  },
  {
    label: "Safety rules",
    title: "Rules decide what counts",
    body: "A detection is not a violation yet. Deterministic rules, such as no helmet inside restricted Zone B, make that call, so every alert can be explained.",
  },
  {
    label: "Review → Dashboard",
    title: "A person has the final say",
    body: "A reviewer approves or dismisses each flagged event before anything is recorded. Verified violations are logged to PostgreSQL through FastAPI and appear on the dashboard.",
  },
];

const CLOSING = "The model proposes, the rules decide, a person confirms.";

/* ------------------------------------------------------------------ */
/* Timeline — every value below is a fraction of scroll progress p     */
/* ------------------------------------------------------------------ */

const TILT = [0.03, 0.15]; // flat, facing frame → isometric tilt
const LIFTS = [
  [0.2, 0.3], // layer 2 (OpenCV) lifts off the frame
  [0.36, 0.46], // layer 3 (YOLO)
  [0.52, 0.62], // layer 4 (rules)
  [0.68, 0.78], // layer 5 (review)
];
const COLLAPSE = [0.86, 0.95]; // layers drop back into one finished frame
const TILT_X = 54;
const TILT_Z = -32;
const GAP = 0.2; // layer spacing as a fraction of plane width (desktop)
const GAP_MOBILE = 0.17;
const TILT_SCALE = 0.9; // the stack shrinks slightly as it tilts (CSS --w is the flat, facing size)
const DIM = 0.4; // opacity of layers that are not active
const SMOOTHING = 0.16; // 1 = no easing toward the scroll position

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);
const mid = ([a, b]) => (a + b) / 2;

function stepAt(p) {
  if (p >= mid(COLLAPSE)) return STEPS.length; // closing panel
  let i = 0;
  while (i < LIFTS.length && p >= mid(LIFTS[i])) i++;
  return i;
}

/* ------------------------------------------------------------------ */
/* Illustrations (viewBox 400×250, same language as CctvVisual)        */
/* ------------------------------------------------------------------ */

const mono = { fontFamily: "var(--font-mono)" };
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

function Tag({ x = 12, y = 12, children, anchor = "start" }) {
  return (
    <text className={s.tag} x={x} y={y + 6} fontSize="7.5" fill="#9a9ca5" textAnchor={anchor} letterSpacing="0.6" style={mono}>
      {children}
    </text>
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

/* 1 — raw camera frame */
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

/* 2 — OpenCV preprocessing: grid + edge outlines */
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

/* 3 — YOLO detections */
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

/* 4 — deterministic safety rules */
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

/* 5 — human review, then the dashboard */
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

const LAYERS = [SceneLayer, PreprocessLayer, DetectLayer, RulesLayer, ReviewLayer];

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const num = (i) => String(i + 1).padStart(2, "0");

function Heading({ className = "" }) {
  return (
    <>
      <p className="eyebrow flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        Inside Guardian Lens
      </p>
      <h2 className={`text-balance font-medium tracking-tight text-fg ${className}`}>
        One frame, five layers of <span className="font-serif italic font-normal text-signal">judgement.</span>
      </h2>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Static fallback: no JS, or prefers-reduced-motion                   */
/* ------------------------------------------------------------------ */

function StaticStory() {
  return (
    <section id="inside" aria-label="How Guardian Lens works" className="relative py-24 md:py-36">
      <div className="container-page">
        <Heading className="mt-5 max-w-2xl text-3xl sm:text-4xl md:text-5xl" />
        <ol className="mt-12 grid gap-4 md:mt-16">
          {STEPS.map((step, i) => {
            const Layer = LAYERS[i];
            return (
              <li key={step.label} className="grid items-center gap-5 rounded-2xl border border-white/[0.07] bg-ink-900 p-4 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:gap-8 sm:p-5">
                <div className="relative aspect-[8/5] overflow-hidden rounded-xl border border-white/10 bg-ink-850 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:h-full [&>svg]:w-full" aria-hidden="true">
                  {i > 1 && (
                    <div className="absolute inset-0 opacity-40 [&>svg]:h-full [&>svg]:w-full">
                      <SceneLayer uid={`st-bg${i}`} hud={false} />
                    </div>
                  )}
                  <Layer uid={`st${i}`} />
                </div>
                <div>
                  <p className="font-mono text-[11px] tracking-wider text-fg-dim">
                    <span className="text-signal">{num(i)}</span> — {step.label}
                  </p>
                  <h3 className="mt-2 text-xl font-medium tracking-tight text-fg">{step.title}</h3>
                  <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-fg-muted">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 max-w-md text-pretty text-lg text-fg">{CLOSING}</p>
        <a href="#work" className="link-underline mt-3 inline-block pb-0.5 font-mono text-xs text-signal">
          See the project ↓
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Enhanced version: sticky stage, driven by scroll progress           */
/* ------------------------------------------------------------------ */

function PinnedStory() {
  const sectionRef = useRef(null);
  const stackRef = useRef(null);
  const sceneRef = useRef(null);
  const railRef = useRef(null);
  const planes = useRef([]);
  const glass = useRef([]);
  const glows = useRef([]);
  const labels = useRef([]);
  const guides = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const stack = stackRef.current;
    if (!section || !stack) return;

    let raf = 0;
    let dirty = true;
    let target = 0;
    let shown = -1;
    let gap = 0;
    let lastStep = 0;
    let geo = { w: 0, h: 0, cx: 0, cy: 0, d: 1700 }; // layout numbers needed to project label anchors

    const draw = (p) => {
      const tiltIn = ease(range(p, TILT[0], TILT[1]));
      const c = ease(range(p, COLLAPSE[0], COLLAPSE[1])); // 1 = recombined
      const tilt = tiltIn * (1 - c);
      const act = [1, ...LIFTS.map(([a, b]) => ease(range(p, a, b)))]; // how far each layer has lifted

      const zs = [];
      let z = 0;
      for (let i = 0; i < act.length; i++) {
        if (i > 0) z += gap * act[i] * (1 - c);
        zs.push(z);
      }
      const scale = 1 + (TILT_SCALE - 1) * tilt;
      const rx = TILT_X * tilt;
      const rz = TILT_Z * tilt;
      const cosX = Math.cos((rx * Math.PI) / 180);
      const sinX = Math.sin((rx * Math.PI) / 180);
      const cosZ = Math.cos((rz * Math.PI) / 180);
      const sinZ = Math.sin((rz * Math.PI) / 180);
      stack.style.transform = `scale(${scale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) translateZ(${(-z / 2).toFixed(1)}px)`;

      for (let i = 0; i < act.length; i++) {
        const focus = act[i] * (1 - (act[i + 1] ?? 0)); // 1 while this is the newest lifted layer
        const exploded = act[i] * (DIM + (1 - DIM) * focus);
        const combined = i === 1 ? 0 : 1; // the preprocessing layer is not part of the finished frame
        const plane = planes.current[i];
        plane.style.transform = `translateZ(${(zs[i] + i * 0.4).toFixed(1)}px)`; // +0.4px per layer: never exactly coplanar, so no z-fighting when flush
        plane.style.opacity = (exploded + (combined - exploded) * c).toFixed(3);
        if (glass.current[i]) glass.current[i].style.opacity = (act[i] * (1 - c)).toFixed(3);
        const hi = (focus * (1 - c) * tiltIn).toFixed(3);
        glows.current[i].style.opacity = hi;
        // Labels live outside the 3D context (so their text stays crisp): project the
        // layer's bottom-right corner through the same rotateZ → rotateX → scale → perspective.
        const lx = geo.w / 2;
        const ly = geo.h / 2;
        const lz = zs[i] - z / 2;
        const x1 = lx * cosZ - ly * sinZ;
        const y1 = lx * sinZ + ly * cosZ;
        const y2 = y1 * cosX - lz * sinX;
        const z2 = y1 * sinX + lz * cosX;
        const f = geo.d / (geo.d - z2 * scale);
        const label = labels.current[i];
        label.style.transform = `translate3d(${((geo.cx + x1 * scale) * f).toFixed(1)}px, ${((geo.cy + y2 * scale) * f).toFixed(1)}px, 0)`;
        label.style.opacity = hi;
      }

      const guideOpacity = (0.55 * tilt * clamp01(z / (gap || 1))).toFixed(3);
      for (const g of guides.current) {
        g.style.transform = `rotateX(90deg) scaleY(${(z / 100).toFixed(4)})`;
        g.style.opacity = guideOpacity;
      }
      stack.style.setProperty("--tag", (1 - c).toFixed(3)); // per-layer corner tags fade as the frame recombines
      if (railRef.current) railRef.current.style.transform = `scaleY(${range(p, 0, COLLAPSE[0]).toFixed(4)})`;

      const step = stepAt(p);
      if (step !== lastStep) {
        lastStep = step;
        setActive(step); // the only React state touched while scrolling
      }
    };

    const tick = () => {
      raf = 0;
      if (dirty) {
        dirty = false;
        const rect = section.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        target = travel > 0 ? clamp01(-rect.top / travel) : 0;
      }
      if (shown < 0) shown = target;
      else {
        shown += (target - shown) * SMOOTHING;
        if (Math.abs(target - shown) < 0.0004) shown = target;
      }
      draw(shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
    };
    const request = () => {
      dirty = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const measure = () => {
      const scene = sceneRef.current;
      const w = stack.offsetWidth;
      const h = stack.offsetHeight;
      geo = {
        w,
        h,
        cx: stack.offsetLeft + w / 2 - scene.clientWidth / 2,
        cy: stack.offsetTop + h / 2 - scene.clientHeight / 2,
        d: parseFloat(getComputedStyle(scene).perspective) || 1700,
      };
      gap = w * (window.innerWidth < 768 ? GAP_MOBILE : GAP);
      shown = -1; // snap, don't ease, after a resize
      request();
    };

    measure();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const closing = active === STEPS.length;

  return (
    <section ref={sectionRef} id="inside" aria-label="How Guardian Lens works" className={s.section}>
      <div className={s.stage}>
        <div className={`container-page ${s.layout}`}>
          <div className={s.textCol}>
            <Heading className="mt-3 text-2xl sm:text-3xl md:mt-5 md:text-4xl lg:text-5xl" />

            <div className={`${s.copyRow} mt-5 md:mt-12`}>
              <div className={s.rail} aria-hidden="true">
                <span ref={railRef} className={s.railFill} />
                {STEPS.map((step, i) => (
                  <span key={step.label} className={s.tick} data-on={i === active} data-done={i < active} />
                ))}
              </div>

              <div className={s.steps}>
                <ol className="contents">
                  {STEPS.map((step, i) => (
                    <li key={step.label} className={s.step} data-state={i === active ? "on" : i < active ? "past" : "next"}>
                      <p className="font-mono text-[11px] tracking-wider text-fg-dim">
                        <span className="text-signal">{num(i)}</span> / {num(STEPS.length - 1)} — {step.label}
                      </p>
                      <h3 className="mt-2 text-lg font-medium tracking-tight text-fg md:mt-3 md:text-2xl">{step.title}</h3>
                      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-fg-muted md:mt-3 md:text-[15px]">{step.body}</p>
                    </li>
                  ))}
                </ol>
                <div className={s.step} data-state={closing ? "on" : "next"}>
                  <p className="font-mono text-[11px] tracking-wider text-ok">● verified · logged</p>
                  <p className="mt-2 max-w-sm text-pretty text-lg font-medium tracking-tight text-fg md:mt-3 md:text-2xl">{CLOSING}</p>
                  <a
                    href="#work"
                    tabIndex={closing ? 0 : -1}
                    className="link-underline mt-3 inline-block pb-0.5 font-mono text-xs text-signal md:mt-5"
                  >
                    See the project ↓
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div ref={sceneRef} className={s.scene} aria-hidden="true">
            <div ref={stackRef} className={s.stack}>
              {[["0", "0"], ["100%", "0"], ["0", "100%"], ["100%", "100%"]].map(([left, top], i) => (
                <span key={i} ref={(el) => { guides.current[i] = el; }} className={s.guide} style={{ left, top }} />
              ))}
              {LAYERS.map((Layer, i) => (
                <div
                  key={i}
                  ref={(el) => { planes.current[i] = el; }}
                  className={s.plane}
                  style={i > 0 ? { opacity: 0 } : undefined}
                >
                  <div className={s.face}>
                    {i > 0 && <div ref={(el) => { glass.current[i] = el; }} className={s.glassBg} />}
                    <Layer uid={`ss${i}`} />
                  </div>
                  <div ref={(el) => { glows.current[i] = el; }} className={s.glow} />
                </div>
              ))}
            </div>
            {STEPS.map((step, i) => (
              <div key={step.label} ref={(el) => { labels.current[i] = el; }} className={s.label}>
                <div className={s.labelInner}>
                  <span className={s.labelDot} />
                  <span className={s.labelLine} />
                  <span>
                    <span className={s.labelNum}>{num(i)}</span> — {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function ScrollStory() {
  // Server render and first client render are the static list, so the content is
  // complete without JS. The pinned 3D version takes over before first paint
  // when motion is allowed.
  const [pinned, setPinned] = useState(false);

  useIsoLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPinned(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return pinned ? <PinnedStory /> : <StaticStory />;
}
