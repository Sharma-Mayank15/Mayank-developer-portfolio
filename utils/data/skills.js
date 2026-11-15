export const skillGroups = [
  {
    title: "AI & ML",
    note: "What I build",
    items: ["LLM applications", "RAG pipelines", "LangChain", "OpenAI API", "Claude API", "MCP · Agent Skills", "Prompt engineering", "LLM evaluation", "YOLO · computer vision", "ONNX Runtime · OpenCV", "Keras · Deep RL (DQN)", "Vertex AI"],
  },
  {
    title: "Product engineering",
    note: "How AI reaches users",
    items: ["React", "TypeScript", "JavaScript (ES6+)", "Redux Toolkit", "RTK Query", "Socket.IO", "Next.js", "Tailwind CSS", "HTML5 / CSS3", "Responsive design"],
  },
  {
    title: "Backend & Data",
    note: "APIs and the data behind them",
    items: ["Node.js", "Express", "FastAPI", "Flask", "REST APIs", "PostgreSQL", "MongoDB", "MySQL", "SQL"],
  },
  {
    title: "Tooling",
    note: "How it ships",
    items: ["Git & GitHub", "Code review", "Docker", "Chrome DevTools", "Claude Code", "Vercel", "AWS (EC2, S3)", "Python", "Java", "C++"],
  },
];

// `icon` keys map to logos in app/components/tech-icon.jsx
export const marquee = [
  { name: "LangChain", icon: "langchain" },
  { name: "OpenAI API", icon: "openai" },
  { name: "Claude API", icon: "claude" },
  { name: "MCP", icon: "mcp" },
  { name: "RAG", icon: "rag" },
  { name: "YOLO", icon: "yolo" },
  { name: "ONNX Runtime", icon: "onnx" },
  { name: "OpenCV", icon: "opencv" },
  { name: "Keras", icon: "keras" },
  { name: "Python", icon: "python" },
  { name: "FastAPI", icon: "fastapi" },
  { name: "React", icon: "react" },
  { name: "TypeScript", icon: "typescript" },
  { name: "Socket.IO", icon: "socketio" },
  { name: "PostgreSQL", icon: "postgres" },
  { name: "Docker", icon: "docker" },
];

export const research = {
  title: "Unlocking the Power of Generative Pre-Training",
  venue: "ICCMST 2024 · Taylor & Francis (CRC Press)",
  description: "A GPT-3-based conversational AI framework. Co-authored chapter published in the conference proceedings.",
  url: "https://www.taylorfrancis.com/chapters/edit/10.1201/9781003561651-11/unlocking-power-generative-pre-training-gpt-3-based-conversational-ai-framework-ishdeep-singla-mayank-sharma-shivam-dubey-aditya-ayush-tyagi-rahul-tiwari",
};

export const certifications = [
  { issuer: "Anthropic Academy", items: "Claude Code, Claude API, Model Context Protocol, Agent Skills, Subagents" },
  { issuer: "Google", items: "Generative AI, Google Cloud AI, Vertex AI, Large Language Models" },
  { issuer: "Oracle", items: "OCI 2025 Certified AI Foundations Associate" },
  { issuer: "IBM", items: "Python Programming, Python Data Structures, Python Development" },
  { issuer: "NPTEL · IIT Kharagpur", items: "Gold Medal, Internet of Things" },
];
