import { FiArrowUpRight, FiGithub, FiLinkedin, FiPhone } from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";
import { personalData } from "@/utils/data/personal-data";
import { CopyEmail, LocalTime, Reveal } from "../ui";
import ContactForm from "./contact-form";
import SupportCard from "./support-card";

const socials = [
  { label: "GitHub", href: personalData.github, icon: FiGithub, handle: "Sharma-Mayank15" },
  { label: "LinkedIn", href: personalData.linkedIn, icon: FiLinkedin, handle: "mayank-sharma15" },
  { label: "LeetCode", href: personalData.leetcode, icon: SiLeetcode, handle: "Mayank_1511" },
];

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-36">
      <div
        className="pointer-events-none absolute bottom-[-20rem] left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
        style={{ background: "radial-gradient(closest-side, #ff6b2c, transparent)" }}
        aria-hidden
      />
      <div className="container-page relative">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-[11px] text-signal">05</span>
            <span className="h-px w-8 bg-white/15" />
            <span className="eyebrow">Contact</span>
          </div>
          <h2 className="max-w-4xl text-balance text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-fg">
            Let&apos;s build something <span className="font-serif font-normal italic text-signal">real</span>.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal delay={80}>
            <p className="max-w-md text-pretty text-lg leading-relaxed text-fg-muted">
              Whether it&apos;s an AI engineering role, a product that needs applied AI shipped end to end, or just a
              good technical conversation — my inbox is open. I usually reply within a day.
            </p>

            <CopyEmail className="group mt-8 flex max-w-full items-center gap-3 text-left text-xl text-fg transition-colors [overflow-wrap:anywhere] hover:text-signal md:text-2xl" />

            <a href={`tel:${personalData.phone.replace(/\s+/g, "")}`} className="mt-3 flex w-fit items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg">
              <FiPhone /> {personalData.phone}
            </a>

            <ul className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {socials.map(({ label, href, icon: Icon, handle }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 py-4">
                    <Icon className="text-fg-muted group-hover:text-signal" />
                    <span className="text-fg">{label}</span>
                    <span className="font-mono text-xs text-fg-dim">{handle}</span>
                    <FiArrowUpRight className="ml-auto text-fg-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 font-mono text-xs text-fg-dim">
              {personalData.location} · <LocalTime /> IST
            </div>
          </Reveal>

          <Reveal delay={160}>
            <ContactForm />
          </Reveal>
        </div>

        <SupportCard />
      </div>
    </section>
  );
}
