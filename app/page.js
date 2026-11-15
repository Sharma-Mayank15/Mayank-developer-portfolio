import About from "./components/sections/about";
import Contact from "./components/sections/contact";
import Experience from "./components/sections/experience";
import Hero from "./components/sections/hero";
import Projects from "./components/sections/projects";
import ScrollStory from "./components/sections/scroll-story";
import Skills from "./components/sections/skills";

// Re-render at most every 30 minutes so the hero's AI wire stays current.
export const revalidate = 1800;

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ScrollStory />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
    </>
  );
}
