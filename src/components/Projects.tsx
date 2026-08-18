import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { projects } from "./projects.json.ts";
import ProjectCard from "./ProjectCard";

export default function EditorialColumn() {
  const rowsRef = useRef([] as (HTMLDivElement | null)[]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    gsap.fromTo(
      rowsRef.current,
      { opacity: 0, x: -15 },
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.06,
        ease: "power2.out",
      },
    );
  }, []);

  return (
    <>
      <h2 className="text-xl uppercase font-bold px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 lg:hidden">Projects</h2>
      <div className="space-y-0 divide-y divide-white/20">
        {projects.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            idx={idx}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            dimmed={hoveredId !== null && hoveredId !== project.id}
            innerRef={(el) => {
              rowsRef.current[idx] = el;
            }}
          />
        ))}
      </div>
      {/*<a href="#about" className="text-white/60 hover:text-white">See the full story</a>*/}
    </>
  );
}
