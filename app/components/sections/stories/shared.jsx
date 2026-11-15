import s from "../scroll-story.module.scss";

// Bits shared by the story illustrations (same visual language as project-visuals.jsx).

export const mono = { fontFamily: "var(--font-mono)" };
export const sans = { fontFamily: "var(--font-sans)" };

// Anything with this class fades out as the layers recombine into the finished object.
export const fadeOnCollapse = s.tag;

/** Small corner caption naming a layer. Fades out on collapse. */
export function Tag({ x = 12, y = 12, children, anchor = "start" }) {
  return (
    <text className={s.tag} x={x} y={y + 6} fontSize="7.5" fill="#9a9ca5" textAnchor={anchor} letterSpacing="0.6" style={mono}>
      {children}
    </text>
  );
}
