import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Hero from "./components/Hero";
import About from "./components/About";
import Background from "./components/backGround";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const sections = [
  { id: 0, label: "About" },
  { id: 1, label: "Projects" },
  { id: 2, label: "Checkpoints" },
];
  
function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = (index: number) => {
    const target = sectionRefs.current[index];
    if (!target) return;
    gsap.to(window, {
      duration: 1.1,
      scrollTo: { y: target, autoKill: false },
      ease: "power4.inOut",
    });
  };

  useEffect(() => {
    sectionRefs.current.forEach((section, index) => {
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      <Background />
      <img
        src={"/face.png"}
        alt="Hassan Aguezoum"
        className="fixed bottom-4 right-4 z-50 w-10 h-10 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-full object-cover"
      />

      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-overlay"
      />

      <div className="relative z-10 text-white antialiased flex flex-col gap-24 px-6 sm:px-4 lg:px-8 max-w-7xl mx-auto lg:flex-row lg:gap-0 selection:bg-white selection:text-black">
        <Hero
          className="lg:sticky lg:top-0 lg:self-start lg:w-[45%] lg:shrink-0 lg:min-h-screen py-10 sm:py-12 lg:py-16 lg:flex lg:flex-col lg:justify-between"
          activeIndex={activeIndex}
          sections={sections}
          onNavClick={scrollToSection}
        />

        <div className="lg:w-[55%] min-w-0">
          <div
            className="mb-16 sm:mb-18 lg:mb-20"
            ref={(el) => {
              sectionRefs.current[0] = el;
            }}
          >
            <About />
          </div>
          <div
            className="mb-16 sm:mb-18 lg:mb-20"
            ref={(el) => {
              sectionRefs.current[1] = el;
            }}
          >
            <Projects />
          </div>

          <div
            className="mb-16 sm:mb-18 lg:mb-20"
            ref={(el) => {
              sectionRefs.current[2] = el;
            }}
          >
            <Experience />
          </div>

          <Footer />
        </div>

      </div>
      <Analytics />
    </>
  );
}

export default App;
