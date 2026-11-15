# CLAUDE.md — Mayank Sharma's portfolio

Context for any Claude session working in this repo: who Mayank is, how he wants to be positioned, and how the site is built.

## Positioning (read first)

- Present Mayank as an **AI-focused software engineer**, not "a frontend developer". Lead with applied AI (computer vision, LLMs/RAG, deep RL, agentic/AI-native workflows). React/TypeScript is how the AI reaches users ("product engineering"), not the headline.
- Keep facts honest. His official job title is **Software Engineer — React JS** at Ditstek. Don't change the title or invent AI work at Ditstek beyond Guardian Lens.
- Tone: confident, specific, metric-driven. Don't write "passionate self-taught developer" filler.

## Profile (source of truth: latest résumé, Aug 2026)

**Mayank Sharma**, Chandigarh, India (IST)
- Email: Mayankaryan309@gmail.com · Phone: +91 7528857335
- GitHub: https://github.com/Sharma-Mayank15 · LinkedIn: https://www.linkedin.com/in/mayank-sharma15/
- LeetCode: https://leetcode.com/u/Mayank_1511/ · Live site: https://mayank-developer-portfolio.vercel.app
- Résumé: served from `public/Mayank_Sharma_Resume.pdf` (the 2026 "IBM" version). Replace that file to update it site-wide; `personalData.resume` points to it.

### Experience
**Ditstek Innovations** (offshore software development firm, Mohali, https://www.ditstek.com)
Software Engineer — React JS, **Aug 2025 – Present**
- **CityWide CWS** (US security workforce management platform), built with React, TypeScript, Redux and Socket.IO. Real-time dispatch status, guard tour tracking and call management from live Socket.IO streams. REST integration with loading, error and empty states. Cut re-renders with React.memo, useMemo and useCallback.
- **Happy Whole Human** (Spain, multi-role wellness platform), built with React, TypeScript, RTK Query, MongoDB and Stripe. Role-based dashboards for Admin, Coach and Client, Stripe payments, and RTK Query caching and invalidation.
- Git PR workflow with code reviews and Chrome DevTools; uses Claude Code daily.

### Projects (AI first)
1. **Guardian Lens**, an AI-powered workplace safety platform. Organisation-level Ditstek project: **never link or publish its source**; the site shows no Source button for it. Stack: Python, YOLO, ONNX Runtime, OpenCV, FastAPI, React, PostgreSQL, Docker. He trained and enhanced local YOLO models for domain-specific safety detection (PPE, zones) from CCTV/IP streams, and built the edge pipeline: OpenCV + ONNX Runtime → deterministic safety rules → human-in-the-loop verification → FastAPI + PostgreSQL.
2. **SmartResume**, a RAG-based LLM resume screening and evaluation system. Repo: https://github.com/Sharma-Mayank15/SmartResume-AI-Screener. Stack: FastAPI, LangChain, OpenAI API, Docker. Prompt workflows and LLM evaluation reach **90%+ screening accuracy**; Dockerized CI/CD.
3. **IntelliTraffic**, adaptive traffic signal control with deep RL. Repo: https://github.com/Sharma-Mayank15/IntelliTraffic-Adaptive-Traffic-Signal-Control-using-Deep-Reinforcement-Learning. Stack: Python, Keras, SUMO, TraCI, DQN. **−35% wait time** and **+28% convergence** from reward tuning.
- Older builds: AI Mental Health Assistant (FastAPI + OpenAI), Order Processing API (Node/Express/MySQL), User Auth API (FastAPI/PostgreSQL/JWT).

### Research, certifications, education
- Paper: *"Unlocking the Power of Generative Pre-Training"* (GPT-3-based conversational AI framework), ICCMST 2024, Taylor & Francis. URL is in `utils/data/skills.js` (`research.url`).
- Certifications:
  - Anthropic Academy: Claude Code, Claude API, MCP, Agent Skills, Subagents
  - Google: Generative AI, Google Cloud AI, Vertex AI, LLMs
  - Oracle: OCI 2025 AI Foundations Associate
  - IBM: Python
  - NPTEL IIT Kharagpur: Gold Medal in IoT
- Education:
  - B.E. Computer Science, Chandigarh University, 2021–2025, CGPA 7.22
  - Class XII (CBSE), I.S Dev Samaj School, 2020–21

### Skills
- AI/ML: LLM apps, RAG, LangChain, OpenAI API, Claude API, MCP, prompt engineering, LLM evaluation, YOLO, ONNX Runtime, OpenCV, Keras, DQN, Vertex AI
- Product: React, TypeScript, Redux Toolkit, RTK Query, Socket.IO, Next.js, Tailwind
- Backend/data: Node, Express, FastAPI, Flask, PostgreSQL, MongoDB, MySQL
- Tooling: Git, Docker, Claude Code, Vercel, AWS basics, Python, Java, C++

## Codebase

- **Next.js 15 (App Router), React 19, Tailwind CSS 3.3, SCSS.** JavaScript, no TypeScript. Deployed on Vercel.
- Run: `npm run dev` (dev) · `npm run build && npm start` (prod check). Lint is skipped during builds.
- **All content lives in `utils/data/`**. To update the site, edit data rather than components:
  - `personal-data.js`: identity, links, summary, hero stats
  - `experience.js`: jobs (with nested client `products`) and education
  - `projects-data.js`: `featuredProjects` (each has a `visual` key: `cctv` | `rag` | `traffic`) and `otherProjects`
  - `skills.js`: skill groups, marquee, research paper, certifications
- Page sections are in `app/components/sections/`, in order: hero → about (bento) → projects → experience → skills → contact. `project-visuals.jsx` holds pure-SVG animated illustrations; their keyframes live in `app/css/globals.scss`.
- Shared primitives are in `app/components/ui.jsx` (`Reveal`, `Spotlight`, `SectionHeading`, `LocalTime`, `CopyEmail`). Also present: a ⌘K / Ctrl+K command palette (`command-palette.jsx`) and a floating nav that highlights the active section (`navbar.jsx`, whose `NAV_LINKS` the palette reuses).
- **Design system:**
  - Colors: near-black `ink-*` surfaces, `fg` text tokens, a single `signal` accent (#ff6b2c, safety orange), and `ok` green for live/success states.
  - Fonts: Geist (sans), Geist Mono (labels/eyebrows), Instrument Serif italic (emphasis words).
  - Tokens are in `tailwind.config.js`; component classes (`card`, `chip`, `btn-primary`, `btn-ghost`, `eyebrow`, `container-page`) are in `globals.scss`.
  - Keep one accent color and avoid purple/pink gradients.
- **Contact form:** `app/api/contact/route.js` emails every message to his Gmail via Nodemailer (primary, with reply-to set to the sender) and optionally pings Telegram. It succeeds if either channel delivers. It needs `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `EMAIL_ADDRESS` and `GMAIL_PASSKEY` in `.env` (gitignored). **Never commit real values**; `.env.example` must stay blank.
