import Nav from "./Nav";
import TypeBadge from "./TypeBadge";
import Links from "./Linkes";

type Section = { id: number; label: string };

type HeroProps = {
  className?: string;
  activeIndex: number;
  sections: Section[];
  onNavClick: (index: number) => void;
};

const Hero = ({ className, activeIndex, sections, onNavClick }: HeroProps) => {
  return (
    <header className={`${className} w-full`}>

      <div className="max-w-xl lg:max-w-none">
        <TypeBadge />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 leading-none">
          Hassan Aguezoum
        </h1>
        <div className="mb-4 text-base sm:text-lg lg:text-xl font-medium flex flex-wrap gap-x-2 gap-y-1">
          <h2>Frontend Engineer</h2>
          <span className="mx-2 text-white/30">/</span>
          <h2>React · Next.js · TypeScript</h2>
        </div>
        <p className="text-sm sm:text-base lg:text-md font-light text-white/60 max-w-sm sm:max-w-md mb-10 lg:mb-16 leading-relaxed">
          I build SaaS dashboards and API-driven products. Responsive, typed, ready to ship.
        </p>
        <Nav
          activeIndex={activeIndex}
          sections={sections}
          onNavClick={onNavClick}
        />
      </div>

      <div className="mt-10 lg:mt-0">
        <Links />
      </div>

    </header>
  );
};

export default Hero;
