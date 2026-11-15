"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./skills.module.scss";

/*
  Skill field — a pointer-reactive constellation of every skill in `skillGroups`.

  - Server render (and no-JS / reduced-motion / no-canvas) shows `children`: the static, semantic
    grouped list. After mount the field takes over and that list becomes screen-reader-only.
  - One rAF loop, paused while the stage is off-screen or the tab is hidden. Nothing in the loop
    touches React state; state only changes when the hovered/pinned *group* changes.
  - Group 0 is the lead cluster (AI & ML): central, larger, tinted with the signal accent.
*/

/* ---------- Tuning. Forces are per 60fps frame; distances are CSS px. ---------- */
const TUNE = {
  homeSpring: 0.016, // pull back to the home position (higher = snappier return)
  damping: 0.9, // velocity kept per frame (lower = settles faster, less wobble)
  linkSpring: 0.022, // spring along links inside a cluster (drag one node, neighbours follow)
  crossSpring: 0.006, // spring along cross-cluster links
  driftAmp: 5, // idle wander radius
  driftSpeed: 0.00075, // idle wander speed (rad per ms)
  pointerRadius: 190, // reach of the cursor force (desktop)
  pointerRadiusTouch: 120,
  pointerForce: 4.2, // push-away strength at the cursor while it is moving
  pointerRest: 0.08, // share of that force a resting cursor keeps (low, so nodes can be hovered and grabbed)
  pointerSpeed: 9, // cursor speed (px per frame) that counts as full force
  swirl: 0.4, // sideways share of the push, makes nodes curl around the cursor
  stir: 0.07, // how much of the cursor's own velocity nearby nodes pick up
  rippleSpeed: 9, // px per frame the click wave travels
  rippleForce: 3.2, // impulse as the wave front passes a node
  rippleBand: 60, // thickness of the wave front
  rippleReach: 560, // how far a wave travels before dying
  dim: 0.2, // opacity of clusters that are not highlighted
  pulses: 8, // signal packets travelling along links (desktop)
  pulsesTouch: 4,
  layoutSquash: 3, // >1 packs clusters narrower and taller before they are spread to fill their region
  layoutIterations: 420, // relaxation passes when computing home positions
};

const SIGNAL = "255,107,44";
const FG = "#ededef";
const FG_MUTED = "#9a9ca5";
const FG_DIM = "#62656e";

/* Cluster regions as [x0, y0, x1, y1] fractions of the stage. Index = group index. */
const REGIONS_WIDE = [
  [0.26, 0.0, 0.74, 0.66], // AI & ML — centre stage
  [0.0, 0.04, 0.26, 0.96], // Product engineering — left
  [0.74, 0.04, 1.0, 0.96], // Backend & Data — right
  [0.26, 0.69, 0.74, 1.0], // Tooling — underneath
];
const REGIONS_NARROW = [
  [0, 0.0, 1, 0.36],
  [0, 0.365, 1, 0.585],
  [0, 0.59, 1, 0.79],
  [0, 0.795, 1, 1.0],
];

/* Links that are true to how the work is actually wired. Names must match the data; unknown names are skipped. */
const LINKS = [
  ["LLM applications", "RAG pipelines"],
  ["RAG pipelines", "LangChain"],
  ["LangChain", "OpenAI API"],
  ["Claude API", "MCP · Agent Skills"],
  ["Prompt engineering", "LLM evaluation"],
  ["YOLO · computer vision", "ONNX Runtime · OpenCV"],
  ["React", "TypeScript"],
  ["React", "Socket.IO"],
  ["Redux Toolkit", "RTK Query"],
  ["Node.js", "Express"],
  ["FastAPI", "PostgreSQL"],
  // cross-cluster
  ["FastAPI", "RAG pipelines"],
  ["FastAPI", "ONNX Runtime · OpenCV"],
  ["React", "LLM applications"],
  ["Socket.IO", "Node.js"],
  ["RTK Query", "REST APIs"],
  ["Next.js", "Vercel"],
  ["Claude Code", "MCP · Agent Skills"],
  ["Claude Code", "Claude API"],
  ["Python", "Keras · Deep RL (DQN)"],
  ["Python", "LangChain"],
  ["Docker", "FastAPI"],
];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function glowSprite(rgb, alpha) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},${alpha})`);
  grad.addColorStop(0.45, `rgba(${rgb},${alpha * 0.38})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return c;
}

export default function SkillField({ groups, children }) {
  const [mode, setMode] = useState("static"); // "static" until mounted and allowed to animate
  const [chipHover, setChipHover] = useState(null);
  const [fieldHover, setFieldHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const activeRef = useRef(null);
  const groupsRef = useRef(groups); // read once per mount: a new array identity must not restart the simulation

  const active = chipHover ?? fieldHover ?? pinned;
  activeRef.current = active;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  // Decide once mounted (so server and first client render match), and follow the OS setting live.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      let ok = false;
      try {
        ok = !mq.matches && !!document.createElement("canvas").getContext("2d");
      } catch {
        ok = false;
      }
      setMode(ok ? "field" : "static");
    };
    decide();
    mq.addEventListener?.("change", decide);
    return () => mq.removeEventListener?.("change", decide);
  }, []);

  useEffect(() => {
    if (mode !== "field") return;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !stage || !ctx) return;

    const family = getComputedStyle(canvas).fontFamily || "monospace";
    const sprites = [glowSprite(SIGNAL, 0.2), glowSprite("255,255,255", 0.085)];

    let W = 0;
    let H = 0;
    let dpr = 1;
    let narrow = false;
    let placed = false;
    let raf = 0;
    let visible = false;
    let last = 0;
    let time = 0;

    const groups = groupsRef.current;
    const nodes = [];
    groups.forEach((g, c) =>
      g.items.forEach((label) => {
        nodes.push({ label, c, x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, hx: 0, hy: 0, r: 3, lw: 0, iw: 0, off: 0, ph: nodes.length * 2.4, near: 0 });
      })
    );
    const byLabel = new Map(nodes.map((n) => [n.label, n]));
    const semantic = LINKS.map(([a, b]) => [byLabel.get(a), byLabel.get(b)]).filter(([a, b]) => a && b);
    let links = [];
    let pulses = [];
    const titles = groups.map((g, c) => ({ text: `${g.title}  ·  ${String(g.items.length).padStart(2, "0")}`.toUpperCase(), x: 0, y: 0, c }));
    const alpha = groups.map(() => 1); // per-cluster opacity (dims when another cluster is highlighted)
    const emph = groups.map(() => 0); // per-cluster highlight amount
    const ripples = [];
    const ptr = { on: false, x: 0, y: 0, vx: 0, vy: 0, s: 0, e: 0, touch: false };
    let drag = null;
    let down = null;
    let hover = null;

    const fontFor = (c) => `${c === 0 ? 500 : 400} ${narrow ? (c === 0 ? 11 : 10.5) : c === 0 ? 12.5 : 11.5}px ${family}`;
    const titleFont = () => `500 ${narrow ? 9.5 : 10}px ${family}`;
    const GAP = 7;

    function measure() {
      for (const n of nodes) {
        ctx.font = fontFor(n.c);
        n.lw = ctx.measureText(n.label).width;
        n.r = n.c === 0 ? (narrow ? 3.5 : 4.5) : narrow ? 2.5 : 3;
        n.iw = n.r * 2 + GAP + n.lw;
        n.off = n.iw / 2 - n.r; // dot centre → label-box centre
      }
    }

    /* Home positions: per-cluster spiral seed → ellipse-collision relaxation → spread to fill the region. */
    function layout() {
      const pad = narrow ? 12 : 22;
      const titleH = narrow ? 22 : 26;
      const padX = narrow ? 10 : 10;
      const padY = narrow ? 6 : 8;
      const lineH = narrow ? 14 : 16;
      const R = (narrow ? REGIONS_NARROW : REGIONS_WIDE).map(([x0, y0, x1, y1]) => ({
        x0: pad + x0 * (W - pad * 2) + 4,
        y0: pad + y0 * (H - pad * 2) + titleH,
        x1: pad + x1 * (W - pad * 2) - 4,
        y1: pad + y1 * (H - pad * 2) - 2,
      }));
      const counts = groups.map((g) => g.items.length);
      const seen = groups.map(() => 0);
      const B = nodes.map((n) => {
        const reg = R[n.c];
        const k = seen[n.c]++;
        const rw = reg.x1 - reg.x0;
        const rh = reg.y1 - reg.y0;
        const rad = Math.sqrt((k + 0.5) / counts[n.c]) * 0.42;
        const ang = k * 2.39996 + n.c * 1.1;
        return {
          n,
          reg,
          x: (reg.x0 + reg.x1) / 2 + Math.cos(ang) * rad * rw,
          y: (reg.y0 + reg.y1) / 2 + Math.sin(ang) * rad * rh,
          hw: n.iw / 2 + padX,
          hh: lineH / 2 + padY,
          iw2: n.iw / 2,
          ih2: lineH / 2,
        };
      });
      const fit = (b) => {
        b.x = clamp(b.x, Math.min(b.reg.x0 + b.iw2, (b.reg.x0 + b.reg.x1) / 2), Math.max(b.reg.x1 - b.iw2, (b.reg.x0 + b.reg.x1) / 2));
        b.y = clamp(b.y, b.reg.y0 + b.ih2, b.reg.y1 - b.ih2);
      };
      const relax = (iterations, pullUntil) => {
        for (let it = 0; it < iterations; it++) {
          const pull = it < pullUntil ? 0.012 : 0;
          for (const b of B) {
            if (pull) {
              b.x += ((b.reg.x0 + b.reg.x1) / 2 - b.x) * pull * (narrow ? 1 : TUNE.layoutSquash);
              b.y += ((b.reg.y0 + b.reg.y1) / 2 - b.y) * pull;
            }
          }
          for (let i = 0; i < B.length; i++) {
            const a = B[i];
            for (let j = i + 1; j < B.length; j++) {
              const b = B[j];
              const sw = a.hw + b.hw;
              const sh = a.hh + b.hh;
              const nx = (b.x - a.x) / sw;
              const ny = (b.y - a.y) / sh;
              const d2 = nx * nx + ny * ny;
              if (d2 >= 1) continue;
              const d = Math.sqrt(d2) || 0.001;
              const push = ((1 - d) / d) * 0.5;
              a.x -= nx * push * sw;
              a.y -= ny * push * sh;
              b.x += nx * push * sw;
              b.y += ny * push * sh;
            }
          }
          for (const b of B) fit(b);
        }
      };
      relax(TUNE.layoutIterations, TUNE.layoutIterations * 0.6);

      // Spread each packed cluster out to breathe inside its region (scaling ≥ 1 keeps it overlap-free).
      groups.forEach((_, c) => {
        const mine = B.filter((b) => b.n.c === c);
        if (!mine.length) return;
        const reg = R[c];
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, mw = 0;
        for (const b of mine) {
          x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x); y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y);
          mw = Math.max(mw, b.iw2);
        }
        const sx = clamp((reg.x1 - reg.x0 - mw * 2) / Math.max(1, x1 - x0), 1, narrow ? 1.25 : 1.7);
        const sy = clamp((reg.y1 - reg.y0 - 16) / Math.max(1, y1 - y0), 1, narrow ? 1.5 : 2.4);
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        for (const b of mine) {
          b.x = (reg.x0 + reg.x1) / 2 + (b.x - mx) * sx;
          b.y = (reg.y0 + reg.y1) / 2 + (b.y - my) * sy;
          fit(b);
        }
      });
      relax(60, 0);

      for (const b of B) {
        b.n.hx = b.x - b.iw2 + b.n.r;
        b.n.hy = b.y;
        if (!placed) {
          // First run: start bunched at the cluster centre so the field blooms open.
          b.n.x = (b.reg.x0 + b.reg.x1) / 2 + (b.n.hx - (b.reg.x0 + b.reg.x1) / 2) * 0.12;
          b.n.y = (b.reg.y0 + b.reg.y1) / 2 + (b.n.hy - (b.reg.y0 + b.reg.y1) / 2) * 0.12;
        }
      }
      placed = true;

      titles.forEach((t) => {
        const mine = nodes.filter((n) => n.c === t.c);
        t.x = Math.min(...mine.map((n) => n.hx - n.r));
        t.y = Math.max(pad + 4, Math.min(...mine.map((n) => n.hy)) - (narrow ? 20 : 26));
        ctx.font = titleFont();
        t.x = clamp(t.x, pad, W - pad - ctx.measureText(t.text).width * 1.25);
      });

      // Links: the semantic ones plus each node's two nearest neighbours in its own cluster.
      const seenPair = new Set();
      links = [];
      const add = (a, b) => {
        const i = nodes.indexOf(a);
        const j = nodes.indexOf(b);
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (i === j || seenPair.has(key)) return;
        seenPair.add(key);
        const cross = a.c !== b.c;
        links.push({ a, b, cross, c: a.c, rest: Math.hypot(b.hx - a.hx, b.hy - a.hy), k: cross ? TUNE.crossSpring : TUNE.linkSpring });
      };
      semantic.forEach(([a, b]) => add(a, b));
      for (const n of nodes) {
        nodes
          .filter((m) => m !== n && m.c === n.c)
          .map((m) => [m, Math.hypot(m.hx + m.off - n.hx - n.off, (m.hy - n.hy) * 2.2)])
          .sort((p, q) => p[1] - q[1])
          .slice(0, 2)
          .forEach(([m]) => add(n, m));
      }
      for (const n of nodes) n.nb = links.filter((l) => l.a === n || l.b === n);
      const count = narrow ? TUNE.pulsesTouch : TUNE.pulses;
      pulses = Array.from({ length: count }, (_, i) => ({ l: links[(i * 7) % links.length], t: i / count, v: 0.006 + (i % 3) * 0.002, dir: i % 2 }));
    }

    function resize() {
      const r = stage.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (!w || !h || (w === W && h === H)) return;
      W = w;
      H = h;
      narrow = W < 760;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      measure();
      layout();
      if (!raf) draw(1);
    }

    function hit(px, py) {
      let best = null;
      let bd = 26;
      for (const n of nodes) {
        if (px > n.x - n.r - 8 && px < n.x + n.r + GAP + n.lw + 8 && py > n.y - 12 && py < n.y + 12) return n;
        const d = Math.hypot(px - n.x, py - n.y);
        if (d < bd) {
          bd = d;
          best = n;
        }
      }
      return best;
    }

    function step(f) {
      const t = time * TUNE.driftSpeed;
      for (const n of nodes) {
        n.ax = (n.hx + Math.sin(t + n.ph) * TUNE.driftAmp - n.x) * TUNE.homeSpring;
        n.ay = (n.hy + Math.cos(t * 1.3 + n.ph * 1.7) * TUNE.driftAmp - n.y) * TUNE.homeSpring;
        n.near = 0;
      }
      for (const l of links) {
        const dx = l.b.x - l.a.x;
        const dy = l.b.y - l.a.y;
        const d = Math.hypot(dx, dy) || 1;
        const s = ((d - l.rest) * l.k) / d;
        l.a.ax += dx * s;
        l.a.ay += dy * s;
        l.b.ax -= dx * s;
        l.b.ay -= dy * s;
      }

      ptr.s += ((ptr.on ? 1 : 0) - ptr.s) * Math.min(1, 0.18 * f);
      if (ptr.s > 0.01 && !drag) {
        const R = ptr.touch ? TUNE.pointerRadiusTouch : TUNE.pointerRadius;
        for (const n of nodes) {
          const dx = n.x + n.off - ptr.x;
          const dy = n.y - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d >= R) continue;
          const q = 1 - d / R;
          const force = q * q * TUNE.pointerForce * ptr.s * (TUNE.pointerRest + (1 - TUNE.pointerRest) * ptr.e);
          const ux = dx / (d || 1);
          const uy = dy / (d || 1);
          n.ax += (ux - uy * TUNE.swirl) * force + ptr.vx * q * TUNE.stir;
          n.ay += (uy + ux * TUNE.swirl) * force + ptr.vy * q * TUNE.stir;
          n.near = q * ptr.s;
        }
      }
      // Energy follows cursor speed: sweeping stirs the field, a resting cursor lets nodes come back to be read or grabbed.
      const want = Math.min(1, Math.hypot(ptr.vx, ptr.vy) / TUNE.pointerSpeed);
      ptr.e += (want - ptr.e) * Math.min(1, (want > ptr.e ? 0.4 : 0.07) * f);
      ptr.vx *= Math.pow(0.8, f);
      ptr.vy *= Math.pow(0.8, f);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += TUNE.rippleSpeed * f;
        if (rp.r > TUNE.rippleReach) {
          ripples.splice(i, 1);
          continue;
        }
        const fade = 1 - rp.r / TUNE.rippleReach;
        for (const n of nodes) {
          const dx = n.x + n.off - rp.x;
          const dy = n.y - rp.y;
          const d = Math.hypot(dx, dy) || 1;
          const band = 1 - Math.abs(d - rp.r) / TUNE.rippleBand;
          if (band <= 0) continue;
          const force = band * fade * fade * TUNE.rippleForce;
          n.ax += (dx / d) * force;
          n.ay += (dy / d) * force;
        }
      }

      const damp = Math.pow(TUNE.damping, f);
      for (const n of nodes) {
        if (n === drag) {
          n.vx = (ptr.x - drag.gx - n.x) * 0.5;
          n.vy = (ptr.y - drag.gy - n.y) * 0.5;
          n.x = ptr.x - drag.gx;
          n.y = ptr.y - drag.gy;
          continue;
        }
        n.vx = (n.vx + n.ax * f) * damp;
        n.vy = (n.vy + n.ay * f) * damp;
        n.x += n.vx * f;
        n.y += n.vy * f;
        // soft walls
        const right = W - 8 - n.r - GAP - n.lw;
        if (n.x < 10) n.vx += (10 - n.x) * 0.08;
        else if (n.x > right) n.vx += (right - n.x) * 0.08;
        if (n.y < 12) n.vy += (12 - n.y) * 0.08;
        else if (n.y > H - 12) n.vy += (H - 12 - n.y) * 0.08;
      }

      for (const p of pulses) {
        p.t += p.v * f;
        if (p.t >= 1) {
          p.t = 0;
          p.l = links[(Math.random() * links.length) | 0];
          p.dir = Math.random() < 0.5 ? 0 : 1;
        }
      }
    }

    function draw(f) {
      const act = activeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const ease = Math.min(1, 0.14 * f);
      for (let c = 0; c < alpha.length; c++) {
        alpha[c] += ((act == null || act === c ? 1 : TUNE.dim) - alpha[c]) * ease;
        emph[c] += ((act === c ? 1 : 0) - emph[c]) * ease;
      }
      const hoverSet = hover ? new Set(hover.nb.flatMap((l) => [l.a, l.b])) : null;
      const nodeAlpha = (n) => (hoverSet && hoverSet.has(n) ? 1 : alpha[n.c]);

      // Auras — additive glows that merge into one soft, deforming body per cluster.
      ctx.globalCompositeOperation = "lighter";
      const aura = narrow ? 170 : 250;
      for (const n of nodes) {
        const a = n.c === 0 ? alpha[0] * (0.75 + emph[0] * 0.25) : emph[n.c] * 0.4;
        if (a < 0.02) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[n.c === 0 ? 0 : 1], n.x + n.off * 0.5 - aura / 2, n.y - aura / 2, aura, aura);
      }
      if (ptr.s > 0.02 && !ptr.touch) {
        ctx.globalAlpha = ptr.s;
        ctx.drawImage(sprites[1], ptr.x - 190, ptr.y - 190, 380, 380);
        ctx.globalAlpha = ptr.s * (0.25 + ptr.e * 0.5);
        ctx.drawImage(sprites[0], ptr.x - 110, ptr.y - 110, 220, 220);
      }
      ctx.globalCompositeOperation = "source-over";

      // Links
      ctx.lineWidth = 1;
      for (let c = 0; c < alpha.length; c++) {
        ctx.globalAlpha = alpha[c];
        ctx.strokeStyle = c === 0 ? `rgba(${SIGNAL},${0.3 + emph[c] * 0.2})` : `rgba(255,255,255,${0.12 + emph[c] * 0.14})`;
        ctx.beginPath();
        for (const l of links) {
          if (l.cross || l.c !== c) continue;
          ctx.moveTo(l.a.x, l.a.y);
          ctx.lineTo(l.b.x, l.b.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = act == null ? 1 : 0.4;
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      for (const l of links) {
        if (!l.cross) continue;
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      if (hover) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = hover.c === 0 ? `rgba(${SIGNAL},0.9)` : "rgba(255,255,255,0.55)";
        ctx.beginPath();
        for (const l of hover.nb) {
          ctx.moveTo(l.a.x, l.a.y);
          ctx.lineTo(l.b.x, l.b.y);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      // Tethers: the cursor briefly joins the graph as a node.
      if (ptr.s > 0.02 && !ptr.touch && !drag) {
        ctx.strokeStyle = "rgb(237,237,239)";
        for (const n of nodes) {
          if (n.near < 0.08) continue;
          ctx.globalAlpha = n.near * 0.5 * nodeAlpha(n);
          ctx.beginPath();
          ctx.moveTo(ptr.x, ptr.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      // Signal packets
      for (const p of pulses) {
        const l = p.l;
        if (!l) continue;
        const k = p.dir ? 1 - p.t : p.t;
        const warm = l.a.c === 0 || l.b.c === 0;
        ctx.globalAlpha = Math.sin(p.t * Math.PI) * Math.min(nodeAlpha(l.a), nodeAlpha(l.b)) * (warm ? 0.95 : 0.6);
        ctx.fillStyle = warm ? `rgb(${SIGNAL})` : FG;
        ctx.beginPath();
        ctx.arc(l.a.x + (l.b.x - l.a.x) * k, l.a.y + (l.b.y - l.a.y) * k, warm ? 1.7 : 1.3, 0, 6.2832);
        ctx.fill();
      }

      // Click waves
      for (const rp of ripples) {
        const fade = 1 - rp.r / TUNE.rippleReach;
        ctx.globalAlpha = fade * fade * 0.55;
        ctx.strokeStyle = `rgb(${SIGNAL})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, 6.2832);
        ctx.stroke();
      }

      // Nodes + labels
      ctx.textBaseline = "middle";
      let font = "";
      for (const n of nodes) {
        const a = nodeAlpha(n);
        const hot = n === hover || n === drag;
        const lit = hot || emph[n.c] > 0.5 || (hoverSet && hoverSet.has(n));
        const r = n.r + (hot ? 1.5 : 0) + n.near * 1.2;
        ctx.globalAlpha = a;
        if (n.c === 0) {
          ctx.strokeStyle = `rgba(${SIGNAL},${0.32 + n.near * 0.4})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3.5, 0, 6.2832);
          ctx.stroke();
          ctx.fillStyle = `rgb(${SIGNAL})`;
        } else {
          ctx.fillStyle = lit ? FG : `rgba(237,237,239,${0.62 + n.near * 0.38})`;
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, 6.2832);
        ctx.fill();
        const want = fontFor(n.c);
        if (want !== font) ctx.font = font = want;
        ctx.fillStyle = n.c === 0 || lit || n.near > 0.45 ? FG : FG_MUTED;
        ctx.fillText(n.label, n.x + n.r + GAP, n.y + 0.5);
      }

      // Cluster titles
      ctx.font = titleFont();
      if ("letterSpacing" in ctx) ctx.letterSpacing = "1.6px";
      for (const t of titles) {
        ctx.globalAlpha = 0.35 + alpha[t.c] * 0.65;
        ctx.fillStyle = t.c === 0 ? `rgb(${SIGNAL})` : emph[t.c] > 0.5 ? FG : FG_DIM;
        ctx.fillText(t.text, t.x, t.y);
      }
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      ctx.globalAlpha = 1;
    }

    const frame = (dt) => {
      const f = dt / 16.667;
      time += dt;
      step(f);
      draw(f);
    };
    const tick = (now) => {
      frame(clamp(now - last, 1, 34));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const should = visible && !document.hidden;
      if (should && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!should && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    /* ---------- Pointer ---------- */
    const setHover = (n) => {
      if (n === hover) return;
      const before = hover ? hover.c : null;
      hover = n;
      canvas.style.cursor = n ? (drag ? "grabbing" : "grab") : "";
      const now = n ? n.c : null;
      if (now !== before) setFieldHover(now);
    };
    const locate = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (ptr.on) {
        ptr.vx = clamp(x - ptr.x, -40, 40);
        ptr.vy = clamp(y - ptr.y, -40, 40);
      }
      ptr.x = x;
      ptr.y = y;
      ptr.touch = e.pointerType !== "mouse";
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse" && !down) return; // touch: only react while a finger is down
      locate(e);
      ptr.on = true;
      if (down && Math.hypot(ptr.x - down.x, ptr.y - down.y) > 6) down.moved = true;
      if (!drag && !ptr.touch) setHover(hit(ptr.x, ptr.y));
    };
    const onDown = (e) => {
      if (e.button) return;
      ptr.on = false; // so locate() does not read a stale position as velocity
      locate(e);
      ptr.on = true;
      const n = hit(ptr.x, ptr.y);
      down = { x: ptr.x, y: ptr.y, node: n, moved: false };
      if (n) {
        drag = n;
        drag.gx = ptr.x - n.x;
        drag.gy = ptr.y - n.y;
        if (!ptr.touch) {
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {}
          canvas.style.cursor = "grabbing";
        }
      }
    };
    const release = (e, cancelled) => {
      if (drag) {
        drag.vx = clamp(ptr.vx * 0.9, -30, 30);
        drag.vy = clamp(ptr.vy * 0.9, -30, 30);
        drag = null;
      }
      if (down && !cancelled && !down.moved) {
        ripples.push({ x: down.x, y: down.y, r: 0 });
        if (ripples.length > 4) ripples.shift();
        if (down.node) {
          const c = down.node.c;
          setPinned((p) => (p === c ? null : c));
        }
      }
      down = null;
      canvas.style.cursor = hover ? "grab" : "";
      if (cancelled || (e && e.pointerType !== "mouse")) {
        ptr.on = false;
        setHover(null);
      }
    };
    const onUp = (e) => release(e, false);
    const onCancel = (e) => release(e, true);
    const onLeave = (e) => {
      if (drag && e.pointerType === "mouse") return; // captured: keep dragging outside the stage
      ptr.on = false;
      setHover(null);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onCancel);
    canvas.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px 0px" }
    );
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    resize();
    // Label widths depend on the web font; re-measure once it has loaded.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive || !W) return;
      measure();
      layout();
    });

    canvas.__field = { nodes, frame, ptr, get links() { return links; }, get running() { return !!raf; } }; // inspection hook for tests

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
      delete canvas.__field;
    };
  }, [mode]);

  const live = mode === "field";
  const shown = active != null ? groups[active] : null;

  return (
    <div>
      {live && (
        <div className={`card ${styles.field}`}>
          <div className="relative z-10 flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-3 sm:px-5">
            <div role="group" aria-label="Highlight a skill group" className="flex flex-wrap gap-2">
              {groups.map((g, i) => {
                const on = active === i;
                return (
                  <button
                    key={g.title}
                    type="button"
                    aria-pressed={pinned === i}
                    aria-label={`${g.title}: ${g.note}. ${g.items.length} skills. ${pinned === i ? "Highlight pinned" : "Pin highlight"}`}
                    onMouseEnter={() => setChipHover(i)}
                    onMouseLeave={() => setChipHover(null)}
                    onFocus={() => setChipHover(i)}
                    onBlur={() => setChipHover(null)}
                    onClick={() => setPinned((p) => (p === i ? null : i))}
                    className={`${on || pinned === i ? "glass-lens text-fg" : "glass text-fg-muted"} ${styles.chip} inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors duration-200 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-signal" : on || pinned === i ? "bg-fg" : "bg-white/40"}`} />
                    {g.title}
                    <span className={pinned === i ? "text-signal" : "text-fg-dim"}>{String(g.items.length).padStart(2, "0")}</span>
                  </button>
                );
              })}
            </div>
            <p className="ml-auto hidden font-mono text-[11px] text-fg-dim lg:block" aria-hidden>
              move · click · drag
            </p>
            <p className="min-h-[1.25rem] w-full text-sm text-fg-muted">
              {shown ? (
                <>
                  <span className="font-medium text-fg">{shown.title}</span>
                  <span className="mx-2 text-fg-dim">/</span>
                  {shown.note}
                  <span className="ml-2 hidden font-mono text-[11px] text-fg-dim sm:inline">{shown.items.length} skills</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-fg">{total} skills, four groups</span>
                  <span className="mx-2 text-fg-dim">/</span>
                  <span className="text-signal">{groups[0].title}</span> at the centre
                </>
              )}
            </p>
          </div>
          <div ref={stageRef} className={styles.stage}>
            <canvas ref={canvasRef} aria-hidden className={`${styles.canvas} font-mono`} />
          </div>
        </div>
      )}
      <div className={live ? "sr-only" : undefined}>{children}</div>
    </div>
  );
}
