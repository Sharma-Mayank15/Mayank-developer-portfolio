// Today's AI & tech headlines for the hero "AI wire" card.
// Source: Hacker News via the public Algolia API (no key needed). Fetched on the server and cached,
// so visitors never call a third party and the page stays static between refreshes.

const API = "https://hn.algolia.com/api/v1/search";
export const NEWS_REVALIDATE_SECONDS = 1800;

// What counts as "AI / tech-industry news" — model launches, labs, chips, outages, tooling.
const TOPIC =
  /\b(AI|A\.I\.|AGI|LLMs?|GPT[-\w.]*|OpenAI|ChatGPT|Anthropic|Claude|Gemini|DeepMind|Nvidia|Ollama|Llama|Mistral|Hugging ?Face|xAI|Grok|DeepSeek|Qwen|Copilot|Cursor|MCP|RAG|agents?|agentic|transformers?|diffusion|neural|machine learning|deep learning|reinforcement learning|inference|fine-?tun\w*|embeddings?|GPUs?|TSMC|open[- ]source model|model weights|benchmark|computer vision|YOLO|robotics?|self-driving|Waymo|outage)\b/i;

const TAGS = [
  [/\b(outage|is down|goes down|incident|degraded|elevated errors?)\b/i, "outage"],
  [/\b(launch\w*|releas\w*|introduc\w*|announc\w*|unveil\w*|now available|open[- ]sourc\w*)\b/i, "launch"],
  [/\b(paper|research|study|benchmark|arxiv)\b/i, "research"],
  [/\b(CEO|acqui\w*|raises?|funding|lawsuit|resign\w*|layoffs?|billion|antitrust)\b/i, "industry"],
];

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
};

async function search(params) {
  const res = await fetch(`${API}?${new URLSearchParams(params)}`, {
    next: { revalidate: NEWS_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`HN API ${res.status}`);
  return (await res.json()).hits || [];
}

/** Returns up to `limit` stories, newest-and-biggest first; [] if the API is unreachable. */
export async function getAiNews(limit = 6) {
  try {
    // Round the window start to the hour so the request URL (and therefore the cache entry) is stable.
    const since = Math.floor(Date.now() / 3600_000) * 3600 - 48 * 3600;
    const [front, recent] = await Promise.all([
      search({ tags: "front_page", hitsPerPage: "60" }),
      search({ tags: "story", numericFilters: `created_at_i>${since},points>120`, hitsPerPage: "100" }),
    ]);

    const seen = new Set();
    return [...front, ...recent]
      .filter((h) => h.title && TOPIC.test(h.title) && !seen.has(h.objectID) && seen.add(h.objectID))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((h) => ({
        id: h.objectID,
        title: h.title.replace(/^(Show|Launch|Tell) HN:\s*/i, ""),
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        discuss: `https://news.ycombinator.com/item?id=${h.objectID}`,
        source: host(h.url),
        points: h.points,
        time: h.created_at_i * 1000,
        tag: (TAGS.find(([re]) => re.test(h.title)) || [null, "news"])[1],
      }));
  } catch (err) {
    console.error("AI wire: could not load headlines —", err.message);
    return [];
  }
}
