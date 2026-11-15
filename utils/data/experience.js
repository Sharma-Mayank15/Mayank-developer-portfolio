export const experiences = [
  {
    id: "ditstek",
    company: "Ditstek Innovations",
    companyNote: "Offshore software development firm",
    url: "https://www.ditstek.com",
    role: "Software Engineer — React JS (Frontend)",
    location: "Mohali, India",
    start: "Aug 2025",
    end: "Present",
    current: true,
    highlights: [
      "Contributed to Guardian Lens, the company's computer-vision workplace-safety platform — training YOLO models and building the edge inference pipeline (see Selected work).",
      "Working in a Git pull-request workflow with regular code reviews, debugging in Chrome DevTools and using AI-assisted development (Claude Code) daily.",
    ],
    products: [
      {
        name: "CityWide CWS",
        region: "United States",
        kind: "Security workforce management platform",
        points: [
          "Built real-time dispatch status, guard tour tracking and call management views consuming live Socket.IO event streams.",
          "Integrated REST APIs against backend contracts, handling loading, error and empty states across data-heavy tables and live views.",
          "Cut unnecessary re-renders on high-frequency live updates with React.memo, useMemo and useCallback.",
        ],
        stack: ["React", "TypeScript", "Redux", "Socket.IO", "REST"],
      },
      {
        name: "Happy Whole Human",
        region: "Spain",
        kind: "Multi-role wellness platform",
        points: [
          "Developed role-based dashboards for Admin, Coach and Client with reusable, typed React components.",
          "Integrated Stripe payments for coaching plans and subscriptions.",
          "Separated data fetching from UI with RTK Query — caching, cache invalidation and async state over MongoDB-backed APIs.",
        ],
        stack: ["React", "TypeScript", "RTK Query", "MongoDB", "Stripe"],
      },
    ],
  },
];

export const education = [
  {
    id: 1,
    title: "B.E. Computer Science",
    institution: "Chandigarh University",
    detail: "CGPA 7.22",
    duration: "2021 — 2025",
  },
  {
    id: 2,
    title: "Class XII (CBSE)",
    institution: "I.S Dev Samaj School, Chandigarh",
    detail: "",
    duration: "2020 — 2021",
  },
];
