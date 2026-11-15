import { FiArrowUpRight, FiHeart } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";
import { Reveal, Spotlight } from "../ui";

/** A cup that fills as you hover the card. Pure SVG + CSS (see `.cup-*` in globals.scss). */
function Cup() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" fill="none" aria-hidden>
      <defs>
        <clipPath id="cup-inner">
          <path d="M30 46h52v34a18 18 0 0 1-18 18H48a18 18 0 0 1-18-18z" />
        </clipPath>
      </defs>
      {/* steam */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-fg-dim">
        <path className="cup-steam" d="M44 34c-5-6 5-9 0-16" />
        <path className="cup-steam" style={{ animationDelay: "-0.9s" }} d="M56 34c-5-6 5-9 0-16" />
        <path className="cup-steam" style={{ animationDelay: "-1.7s" }} d="M68 34c-5-6 5-9 0-16" />
      </g>
      {/* coffee */}
      <g clipPath="url(#cup-inner)">
        <rect className="cup-fill" x="28" y="44" width="56" height="56" fill="#ff6b2c" />
      </g>
      {/* cup + handle + saucer */}
      <path d="M30 46h52v34a18 18 0 0 1-18 18H48a18 18 0 0 1-18-18z" stroke="#ededef" strokeWidth="3" strokeLinejoin="round" />
      <path d="M82 54h6a10 10 0 0 1 0 20h-6" stroke="#ededef" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 106h68" stroke="#ededef" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function SupportCard() {
  const { buyMeACoffee, githubSponsors } = personalData.support || {};
  if (!buyMeACoffee && !githubSponsors) return null;

  return (
    <Reveal className="mt-16">
      <Spotlight className="cup-card flex flex-col items-center gap-8 p-7 text-center sm:flex-row sm:p-9 sm:text-left">
        <Cup />
        <div className="flex-1">
          <div className="eyebrow mb-3">Fuel the next build</div>
          <h3 className="text-balance text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Found something useful here? <span className="font-serif italic text-fg-muted">Buy me a coffee.</span>
          </h3>
          <p className="mt-3 max-w-xl text-pretty text-fg-muted">
            Everything on this site is built in the open hours after work. A coffee goes straight into GPU time,
            model experiments and the next project write-up.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          {buyMeACoffee && (
            <a
              href={`https://buymeacoffee.com/${buyMeACoffee}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-signal text-ink-950 hover:bg-signal-soft"
            >
              Buy me a coffee <FiArrowUpRight />
            </a>
          )}
          {githubSponsors && (
            <a
              href={`https://github.com/sponsors/${githubSponsors}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost justify-center"
            >
              <FiHeart /> Sponsor on GitHub
            </a>
          )}
        </div>
      </Spotlight>
    </Reveal>
  );
}
