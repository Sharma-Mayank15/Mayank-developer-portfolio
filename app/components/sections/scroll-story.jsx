"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import s from "./scroll-story.module.scss";

/* ------------------------------------------------------------------ */
/* Scroll-driven "exploded view" engine.                               */
/*                                                                     */
/* A story is plain data (see ./stories/*.jsx):                        */
/*   id, ariaLabel, eyebrow, heading (JSX)                             */
/*   steps: [{ label, title, body, Layer, inResult?, backdrop? }]      */
/*     Layer     SVG illustration for that layer, receives { uid }     */
/*     inResult  false = layer fades out of the recombined result      */
/*     backdrop  true  = static fallback draws <Backdrop> beneath it   */
/*   Backdrop    faint base illustration for the static fallback       */
/*   closing: { kicker, line, href, linkLabel }                        */
/*   view?:     overrides of DEFAULT_VIEW                              */
/*   timeline?: overrides of DEFAULT_TIMELINE                          */
/* ------------------------------------------------------------------ */

/* Every timeline value is a fraction of scroll progress p (0 → 1). */
const DEFAULT_TIMELINE = {
  tilt: [0.03, 0.15], // flat, facing object → isometric tilt
  lifts: [
    [0.2, 0.3], // layer 2 lifts off the base
    [0.36, 0.46], // layer 3
    [0.52, 0.62], // layer 4
    [0.68, 0.78], // layer 5
  ],
  collapse: [0.86, 0.95], // layers drop back into one finished object
};

const DEFAULT_VIEW = {
  length: "450vh", // scroll length of the pinned scene (desktop)
  lengthMobile: "400vh",
  shape: "landscape", // sizes per shape live in the .scss ([data-shape])
  aspect: "8 / 5", // must match the layers' viewBox
  mirror: false, // true = object left, text right (desktop)
  tiltX: 54,
  tiltZ: -32,
  gap: 0.2, // layer spacing as a fraction of plane width (desktop)
  gapMobile: 0.17,
  tiltScale: 0.9, // the stack shrinks slightly as it tilts (CSS --w is the flat, facing size)
  labelCorner: [1, 1], // plane corner the 2D label is pinned to: [x, y], each −1 or 1
  labelSide: "right", // which way the label runs from that corner
  staticMaxWidth: null, // cap the illustration width in the static fallback (portrait shapes)
};

const DIM = 0.4; // opacity of layers that are not active
const SMOOTHING = 0.16; // 1 = no easing toward the scroll position

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);
const mid = ([a, b]) => (a + b) / 2;
const num = (i) => String(i + 1).padStart(2, "0");

function Heading({ story, className = "" }) {
  return (
    <>
      <p className="eyebrow flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        {story.eyebrow}
      </p>
      <h3 className={`text-balance font-medium tracking-tight text-fg ${className}`}>{story.heading}</h3>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Static fallback: no JS, or prefers-reduced-motion                   */
/* ------------------------------------------------------------------ */

function StaticStory({ story }) {
  const { steps, closing, Backdrop } = story;
  const view = { ...DEFAULT_VIEW, ...story.view };
  return (
    <section id={story.id} aria-label={story.ariaLabel} className="relative py-20 md:py-36">
      <div className="container-page">
        <Heading story={story} className="mt-5 max-w-2xl text-3xl sm:text-4xl md:text-5xl" />
        <ol className="mt-12 grid gap-4 md:mt-16">
          {steps.map((step, i) => {
            const Layer = step.Layer;
            return (
              <li key={step.label} className="grid items-center gap-5 rounded-2xl border border-white/[0.07] bg-ink-900 p-4 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:gap-8 sm:p-5">
                <div
                  className="relative mx-auto w-full overflow-hidden rounded-xl border border-white/10 bg-ink-850 [&>svg]:absolute [&>svg]:inset-0 [&>svg]:h-full [&>svg]:w-full"
                  style={{ aspectRatio: view.aspect, maxWidth: view.staticMaxWidth || undefined }}
                  aria-hidden="true"
                >
                  {step.backdrop && Backdrop && (
                    <div className="absolute inset-0 opacity-40 [&>svg]:h-full [&>svg]:w-full">
                      <Backdrop uid={`${story.id}-sb${i}`} />
                    </div>
                  )}
                  <Layer uid={`${story.id}-s${i}`} />
                </div>
                <div>
                  <p className="font-mono text-[11px] tracking-wider text-fg-dim">
                    <span className="text-signal">{num(i)}</span> — {step.label}
                  </p>
                  <h4 className="mt-2 text-xl font-medium tracking-tight text-fg">{step.title}</h4>
                  <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-fg-muted">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 max-w-md text-pretty text-lg text-fg">{closing.line}</p>
        <a href={closing.href} className="link-underline mt-3 inline-block pb-0.5 font-mono text-xs text-signal">
          {closing.linkLabel}
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Enhanced version: sticky stage, driven by scroll progress           */
/* ------------------------------------------------------------------ */

function PinnedStory({ story }) {
  const { steps, closing } = story;
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
  const view = { ...DEFAULT_VIEW, ...story.view };

  useEffect(() => {
    const section = sectionRef.current;
    const stack = stackRef.current;
    if (!section || !stack) return;

    const v = { ...DEFAULT_VIEW, ...story.view };
    const { tilt: TILT, lifts: LIFTS, collapse: COLLAPSE } = { ...DEFAULT_TIMELINE, ...story.timeline };
    const inResult = story.steps.map((step) => (step.inResult === false ? 0 : 1));
    const stepAt = (p) => {
      if (p >= mid(COLLAPSE)) return story.steps.length; // closing panel
      let i = 0;
      while (i < LIFTS.length && p >= mid(LIFTS[i])) i++;
      return i;
    };

    let raf = 0;
    let dirty = true;
    let target = 0;
    let shown = -1;
    let drawn = -1;
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
      const scale = 1 + (v.tiltScale - 1) * tilt;
      const rx = v.tiltX * tilt;
      const rz = v.tiltZ * tilt;
      const cosX = Math.cos((rx * Math.PI) / 180);
      const sinX = Math.sin((rx * Math.PI) / 180);
      const cosZ = Math.cos((rz * Math.PI) / 180);
      const sinZ = Math.sin((rz * Math.PI) / 180);
      stack.style.transform = `scale(${scale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) translateZ(${(-z / 2).toFixed(1)}px)`;

      for (let i = 0; i < act.length; i++) {
        const focus = act[i] * (1 - (act[i + 1] ?? 0)); // 1 while this is the newest lifted layer
        const exploded = act[i] * (DIM + (1 - DIM) * focus);
        const plane = planes.current[i];
        plane.style.transform = `translateZ(${(zs[i] + i * 0.4).toFixed(1)}px)`; // +0.4px per layer: never exactly coplanar, so no z-fighting when flush
        plane.style.opacity = (exploded + (inResult[i] - exploded) * c).toFixed(3);
        if (glass.current[i]) glass.current[i].style.opacity = (act[i] * (1 - c)).toFixed(3);
        const hi = (focus * (1 - c) * tiltIn).toFixed(3);
        glows.current[i].style.opacity = hi;
        // Labels live outside the 3D context (so their text stays crisp): project one corner
        // of the layer through the same rotateZ → rotateX → scale → perspective.
        const lx = (v.labelCorner[0] * geo.w) / 2;
        const ly = (v.labelCorner[1] * geo.h) / 2;
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
      stack.style.setProperty("--tag", (1 - c).toFixed(3)); // per-layer corner tags fade as the object recombines
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
      if (shown !== drawn) {
        drawn = shown; // nothing to write while the scene is parked above or below the viewport
        draw(shown);
      }
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
      gap = w * (window.innerWidth < 768 ? v.gapMobile : v.gap);
      shown = -1; // snap, don't ease, after a resize
      drawn = -1;
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
  }, [story]);

  const isClosing = active === steps.length;

  return (
    <section
      ref={sectionRef}
      id={story.id}
      aria-label={story.ariaLabel}
      className={s.section}
      data-shape={view.shape}
      data-mirror={view.mirror ? "true" : undefined}
      style={{ "--len": view.length, "--len-m": view.lengthMobile, "--ar": view.aspect }}
    >
      <div className={s.stage}>
        <div className={`container-page ${s.layout}`}>
          <div className={s.textCol}>
            <Heading story={story} className="mt-3 text-2xl sm:text-3xl md:mt-5 md:text-4xl lg:text-5xl" />

            <div className={`${s.copyRow} mt-5 md:mt-12`}>
              <div className={s.rail} aria-hidden="true">
                <span ref={railRef} className={s.railFill} />
                {steps.map((step, i) => (
                  <span key={step.label} className={s.tick} data-on={i === active} data-done={i < active} />
                ))}
              </div>

              <div className={s.steps}>
                <ol className="contents">
                  {steps.map((step, i) => (
                    <li key={step.label} className={s.step} data-state={i === active ? "on" : i < active ? "past" : "next"}>
                      <p className="font-mono text-[11px] tracking-wider text-fg-dim">
                        <span className="text-signal">{num(i)}</span> / {num(steps.length - 1)} — {step.label}
                      </p>
                      <h4 className="mt-2 text-lg font-medium tracking-tight text-fg md:mt-3 md:text-2xl">{step.title}</h4>
                      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-fg-muted md:mt-3 md:text-[15px]">{step.body}</p>
                    </li>
                  ))}
                </ol>
                <div className={s.step} data-state={isClosing ? "on" : "next"}>
                  <p className="font-mono text-[11px] tracking-wider text-ok">{closing.kicker}</p>
                  <p className="mt-2 max-w-sm text-pretty text-lg font-medium tracking-tight text-fg md:mt-3 md:text-2xl">{closing.line}</p>
                  <a
                    href={closing.href}
                    tabIndex={isClosing ? 0 : -1}
                    className="link-underline mt-3 inline-block pb-0.5 font-mono text-xs text-signal md:mt-5"
                  >
                    {closing.linkLabel}
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
              {steps.map(({ Layer }, i) => (
                <div
                  key={i}
                  ref={(el) => { planes.current[i] = el; }}
                  className={s.plane}
                  style={i > 0 ? { opacity: 0 } : undefined}
                >
                  <div className={s.face}>
                    {i > 0 && <div ref={(el) => { glass.current[i] = el; }} className={s.glassBg} />}
                    <Layer uid={`${story.id}-p${i}`} />
                  </div>
                  <div ref={(el) => { glows.current[i] = el; }} className={s.glow} />
                </div>
              ))}
            </div>
            {steps.map((step, i) => (
              <div key={step.label} ref={(el) => { labels.current[i] = el; }} className={s.label} data-side={view.labelSide}>
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

export default function ScrollStory({ story }) {
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

  return pinned ? <PinnedStory story={story} /> : <StaticStory story={story} />;
}
