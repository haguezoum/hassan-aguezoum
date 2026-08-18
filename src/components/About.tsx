const About = () => {
  return (
    <section className="py-18 sm:py-20 lg:py-22 px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl uppercase font-bold mb-10 sm:mb-12 lg:hidden">About</h2>
      <div className="flex flex-col gap-5 sm:gap-6 max-w-3xl">
        <p className="text-base sm:text-lg font-light text-white/60 leading-relaxed">
          I'm <span className="text-white font-normal">Hassan</span>, a frontend engineer focused on{" "}
          <span className="text-white font-normal">SaaS dashboards</span> and API-driven products. React,
          Next.js, TypeScript. Interfaces that stay responsive, typed, and honest about their data.
        </p>

        <p className="text-base sm:text-lg font-light text-white/60 leading-relaxed">
          That's what <span className="text-white font-normal">1337</span> gave me. Not a curriculum, but a
          way of thinking. No teachers, no handholding. Just real problems, real teammates, and the habit of{" "}
          <span className="text-white font-normal">figuring things out</span>.
        </p>

        <p className="text-base sm:text-lg font-light text-white/60 leading-relaxed">
          I'm building{" "}
          <a href="https://mytabib.me" target="_blank" rel="noopener noreferrer" className="text-white font-normal underline underline-offset-4 decoration-white/20 hover:decoration-white transition-all">Tabib</a>
          — a healthcare scheduling platform with a mobile-friendly patient booking flow and a dashboard for
          doctors to organize availability. Onboarding, auth, trial conversion, and the analytics that tell
          you which of those actually matter.
        </p>

        <p className="text-base sm:text-lg font-light text-white/60 leading-relaxed">
          Alongside that I ship end-to-end SaaS features in a two-developer team:{" "}
          <span className="text-white font-normal">Next.js</span> in front,{" "}
          <span className="text-white font-normal">NestJS</span> behind it, Swagger-documented REST in
          between. Before that, at <span className="text-white font-normal">Infinitive Byte</span>, I built
          the frontend for a SaaS product and wired it to Django APIs — loading states, Docker delivery, the
          last mile that makes a dashboard usable.
        </p>

        <p className="text-base sm:text-lg font-light text-white/60 leading-relaxed">
          I do my best work where the{" "}
          <span className="text-white font-normal">interface meets the API</span>. Clean components,
          documented contracts, deployments that survive the first real user.
        </p>

        <p className="text-base sm:text-lg font-light text-white/60 leading-relaxed">
          Based in <span className="text-white font-normal">Morocco</span>. Available immediately for remote{" "}
          <span className="text-white font-normal">EMEA</span> or worldwide contract work. Arabic, English,
          French.
        </p>
      </div>
    </section>
  );
};

export default About;