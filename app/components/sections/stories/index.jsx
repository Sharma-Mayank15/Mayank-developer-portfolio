"use client";

// Stories hold components (the layer illustrations), so they can't be passed as props from a
// server component. projects.jsx passes the project's `visual` key and the lookup happens here.

import ScrollStory from "../scroll-story";
import guardian from "./guardian";
import rag from "./rag";
import traffic from "./traffic";

// Keyed by `visual` in utils/data/projects-data.js
const STORIES = { cctv: guardian, rag, traffic };

export default function ProjectStory({ visual }) {
  const story = STORIES[visual];
  return story ? <ScrollStory story={story} /> : null;
}
