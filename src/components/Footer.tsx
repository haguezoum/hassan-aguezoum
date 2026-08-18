import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FaXTwitter } from "react-icons/fa6";

const quotes = [
  '"Developers work hard to earn money and they give their work for free at the same time."',
  '"Remember kids, modern problems require modern solutions."',
  '"facebook is down, thanks god not our app #facebook_is_down"',
];

const pickNext = (current: number) => {
  if (quotes.length < 2) return current;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * quotes.length);
  }
  return next;
};

const Footer = () => {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * quotes.length),
  );
  const [visible, setVisible] = useState(true);
  const logoRef = useRef<HTMLSpanElement>(null);
  const playing = useRef(false);
  const hovered = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fadeMs = reduceMotion ? 0 : 280;
    let fadeTimeout = 0;

    const interval = window.setInterval(() => {
      if (hovered.current) return;
      setVisible(false);
      window.clearTimeout(fadeTimeout);
      fadeTimeout = window.setTimeout(() => {
        setIndex((current) => pickNext(current));
        setVisible(true);
      }, fadeMs);
    }, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimeout);
      const el = logoRef.current;
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  const playX = () => {
    const el = logoRef.current;
    if (!el || playing.current) return;
    playing.current = true;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.killTweensOf(el);

    if (reduceMotion) {
      gsap
        .timeline({
          onComplete: () => {
            playing.current = false;
          },
        })
        .set(el, { autoAlpha: 0, rotation: 0, x: 0 })
        .to(el, { autoAlpha: 1, duration: 0.2 })
        .to(el, { autoAlpha: 0, duration: 0.25, delay: 0.9 });
      return;
    }

    gsap
      .timeline({
        onComplete: () => {
          playing.current = false;
        },
      })
      .set(el, { autoAlpha: 0, rotation: 0, x: 0, scale: 0.85 })
      .to(el, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
      .to(el, {
        rotation: 30,
        x: 10,
        duration: 0.35,
        ease: "sine.inOut",
      })
      .to(el, {
        rotation: -30,
        x: -10,
        duration: 0.45,
        ease: "sine.inOut",
      })
      .to(el, {
        rotation: 30,
        x: 10,
        duration: 0.45,
        ease: "sine.inOut",
      })
      .to(el, {
        rotation: -30,
        x: -10,
        duration: 0.45,
        ease: "sine.inOut",
      })
      .to(el, {
        autoAlpha: 0,
        rotation: 0,
        x: 0,
        duration: 0.35,
        ease: "power2.in",
      });
  };

  return (
    <footer className="relative py-16 sm:py-18 lg:py-22 lg:pb-18 px-4 sm:px-6 lg:px-8">
      <p
        aria-live="polite"
        onPointerEnter={() => {
          hovered.current = true;
          playX();
        }}
        onPointerLeave={() => {
          hovered.current = false;
        }}
        className={`text-sm sm:text-md font-light text-white/50 leading-relaxed max-w-3xl min-h-16 text-pretty transition-opacity duration-300 ease-out motion-reduce:transition-none cursor-default ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {quotes[index]}{" "}
        <span className="relative inline-flex items-center gap-1.5">
          <a
            href="https://x.com/hassan_aguezoum"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 font-normal hover:text-white transition-colors duration-200"
          >
            — @hassan_aguezoum
          </a>
          <span
            ref={logoRef}
            aria-hidden="true"
            className="pointer-events-none inline-flex"
            style={{ visibility: "hidden", opacity: 0 }}
          >
            <FaXTwitter className="text-white/80 w-3.5 h-3.5" />
          </span>
        </span>
      </p>
    </footer>
  );
};

export default Footer;
