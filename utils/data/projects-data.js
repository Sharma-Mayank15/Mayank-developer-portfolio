// `visual` picks the animated illustration rendered on the featured card.
export const featuredProjects = [
  {
    id: "guardian-lens",
    index: "01",
    name: "Guardian Lens",
    subtitle: "AI-powered workplace safety platform",
    description:
      "An organization-level platform that watches CCTV / IP camera streams and flags workplace-safety violations in real time, running locally trained vision models at the edge, so footage never has to leave the site.",
    points: [
      "Trained and enhanced local YOLO vision models for domain-specific safety detection (PPE, restricted zones).",
      "Built the edge AI pipeline with OpenCV and ONNX Runtime, feeding detections into deterministic safety rules.",
      "Human-in-the-loop verification of alerts, backed by a FastAPI + PostgreSQL service and a React dashboard.",
    ],
    stack: ["Python", "YOLO", "ONNX Runtime", "OpenCV", "FastAPI", "React", "PostgreSQL", "Docker"],
    pipeline: ["RTSP stream", "OpenCV", "YOLO · ONNX", "Safety rules", "Human review", "Dashboard"],
    role: "AI / Full-stack contributor",
    // Company repo in the Ditstek org — private, so the card shows a "Private repo" badge instead of a dead link.
    // To link it publicly later, move the URL to `code` and delete `privateRepo`.
    privateRepo: "https://github.com/Ditstek-Innovations/GuardianLens",
    visual: "cctv",
  },
  {
    id: "resume-screener",
    index: "02",
    name: "SmartResume",
    subtitle: "RAG-based LLM resume screening & evaluation",
    description:
      "A retrieval-augmented screening system that reads resumes the way a recruiter would: retrieving the relevant evidence for each requirement and asking an LLM to score the match with reasons, not just keywords.",
    points: [
      "RAG pipeline with FastAPI, LangChain and OpenAI APIs for contextual candidate evaluation and role matching.",
      "Designed prompt workflows and LLM evaluation pipelines reaching 90%+ screening accuracy.",
      "Shipped with Dockerized CI/CD pipelines.",
    ],
    stack: ["Python", "FastAPI", "LangChain", "OpenAI API", "Docker"],
    metric: { value: "90%+", label: "screening accuracy" },
    role: "Backend & AI engineer",
    code: "https://github.com/Sharma-Mayank15/SmartResume-AI-Screener",
    visual: "rag",
  },
  {
    id: "intellitraffic",
    index: "03",
    name: "IntelliTraffic",
    subtitle: "Adaptive traffic signal control with deep RL",
    description:
      "A Deep Q-Network agent that learns when to switch traffic lights by watching queue lengths in a SUMO simulation, then outperforms fixed-time signals across multiple traffic scenarios.",
    points: [
      "DQN controller driving SUMO through TraCI, cutting simulated vehicle wait time by 35%.",
      "Custom reward and state design improved model convergence by 28%.",
      "Results piped to dashboards to visualize wait-time reduction in real time.",
    ],
    stack: ["Python", "Keras", "SUMO", "TraCI", "DQN"],
    metric: { value: "−35%", label: "average wait time" },
    role: "ML engineer · research",
    code: "https://github.com/Sharma-Mayank15/IntelliTraffic-Adaptive-Traffic-Signal-Control-using-Deep-Reinforcement-Learning",
    visual: "traffic",
  },
];

export const otherProjects = [
  {
    name: "AI Mental Health Support Assistant",
    description: "Empathetic GPT-based chatbot with session memory and a chat-first UI.",
    stack: ["FastAPI", "OpenAI API", "JavaScript"],
    year: "2024",
    code: "https://github.com/Sharma-Mayank15/ai-mental-health-assistant",
  },
  {
    name: "Order Processing System",
    description: "RESTful order, tracking and inventory API on a relational MySQL schema.",
    stack: ["Node.js", "Express", "MySQL", "Docker"],
    year: "2024",
    code: "https://github.com/Oliver-Twist15/order-management-api",
  },
  {
    name: "User Auth & Management API",
    description: "JWT auth, role-based access control and hashed credentials on PostgreSQL.",
    stack: ["FastAPI", "PostgreSQL", "JWT", "Docker"],
    year: "2024",
    code: "https://github.com/Oliver-Twist15/Backend-API-for-User-Authentication-and-Management",
  },
];
