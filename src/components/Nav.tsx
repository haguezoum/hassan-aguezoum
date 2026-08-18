import { useEffect, useRef } from "react";

type Section = { id: number; label: string };

type NavProps = {
  activeIndex: number;
  sections: Section[];
  onNavClick: (index: number) => void;
};

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const Nav = ({ activeIndex, sections, onNavClick }: NavProps) => {
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const activeIntervals = new Map<HTMLSpanElement, ReturnType<typeof window.setInterval>>();

    const stopAnimation = (el: HTMLSpanElement) => {
      const runningInterval = activeIntervals.get(el);
      if (!runningInterval) return;

      clearInterval(runningInterval);
      activeIntervals.delete(el);
    };

    labelRefs.current.forEach((el) => {
      if (!el) return;

      const originalValue = el.dataset.value!;

      const handleMouseEnter = () => {
        stopAnimation(el);

        let i = 0;
        const interval = window.setInterval(() => {
          el.innerText = originalValue
            .split("")
            .map((_, index) => {
              if (index < i) return originalValue[index];
              return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("");

          if (i >= originalValue.length) clearInterval(interval);
          i += 1 / 3;

          if (i >= originalValue.length) {
            activeIntervals.delete(el);
          }
        }, 40);

        activeIntervals.set(el, interval);
      };

      const handleMouseLeave = () => {
        stopAnimation(el);
        el.innerText = originalValue;
      };

      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
        const runningInterval = activeIntervals.get(el);
        if (runningInterval) {
          clearInterval(runningInterval);
          activeIntervals.delete(el);
        }
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <nav className="hidden lg:flex flex-col gap-2">
      {sections.map((section, i) => (
        <button
          type="button"
          key={section.id}
          onClick={() => onNavClick(i)}
          aria-current={activeIndex === i ? "location" : undefined}
          className={`
                        bg-linear-to-r from-black/50 to-transparent
                        flex items-center gap-1 px-4 py-2 cursor-pointer text-left w-full
                        transition-all duration-300
                        border-0 outline-none
                        focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-0
                        ${activeIndex === i ? "text-white" : "text-white/40 hover:text-white/80"}
                    `}
        >
          <span
            className={`
                        font-mono tracking-widest
                        ${activeIndex === i ? "text-base text-white " : "text-sm text-white/20 -translate-x-2"}
                    `}
          >
            0{i + 1}.
          </span>
          <span
            ref={(rf) => {
              labelRefs.current[i] = rf;
            }}
            data-value={section.label}
            className={`
                            font-light tracking-tight uppercase
                            ${activeIndex === i ? "text-base translate-x-2" : "text-sm -translate-x-2"}
                        `}
          >
            {section.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default Nav;
