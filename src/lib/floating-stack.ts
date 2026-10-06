type Point = { x: number; y: number; size: number; rotation: number; float: number; opacity: number };
type StackDock = { element: HTMLElement; slots: Map<string, HTMLElement>; top: number; bottom: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
// Zero velocity and acceleration at both ends keep departure and docking gentle.
const ease = (value: number) => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix = (start: number, end: number, progress: number) => start + (end - start) * progress;

// Projects, work, and education share one timeline; rows without a dock are waiting stops.
export function stackJourney(scroll: number, stops: number[], entryDistance: number, travelDistance: number) {
  for (let index = 0; index < stops.length; index++) {
    if (scroll < stops[index]) {
      const distance = index === 0 ? entryDistance : Math.min(travelDistance, (stops[index] - stops[index - 1]) * .55);
      return { from: index - 1, to: index, progress: ease((scroll - stops[index] + distance) / distance) };
    }
  }
  return { from: stops.length - 1, to: stops.length - 1, progress: 1 };
}

export function stackPointBetween(from: Point, to: Point, progress: number): Point {
  const p = clamp(progress);
  const lift = Math.min(24, Math.hypot(to.x - from.x, to.y - from.y) * .08) * 4 * p * (1 - p);
  return {
    x: mix(from.x, to.x, p), y: mix(from.y, to.y, p) - lift,
    size: mix(from.size, to.size, p), rotation: mix(from.rotation, to.rotation, p),
    float: mix(from.float, to.float, p), opacity: mix(from.opacity, to.opacity, p),
  };
}

export function initFloatingStack() {
  const layer = document.querySelector<HTMLElement>("[data-stack-travelers]");
  const home = document.querySelector<HTMLElement>("[data-stack-home]");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!layer || !home) return;

  // The fixed layer must live outside any sticky/animated containing blocks.
  document.body.append(layer);
  const homes = new Map(Array.from(home.querySelectorAll<HTMLElement>("[data-stack-home-key]"))
    .map((element) => [element.dataset.stackHomeKey!, element]));
  const icons = Array.from(layer.querySelectorAll<HTMLElement>("[data-stack-icon]"))
    .map((element, index) => ({ element, key: element.dataset.stackIcon!, index }));
  const docks: StackDock[] = Array.from(document.querySelectorAll<HTMLElement>("[data-stack-entry]"))
    .map((element) => ({
      element,
      slots: new Map(Array.from(element.querySelectorAll<HTMLElement>("[data-stack-slot]"))
        .map((slot) => [slot.dataset.stackSlot!, slot])),
      top: 0,
      bottom: 0,
    }));
  if (!docks.length || !icons.length) return;

  let frame = 0;
  let dirty = true;
  let stops: number[] = [];
  let contactHeight = 0;
  let destroyed = false;

  function measure() {
    docks.forEach((dock) => {
      const rect = dock.element.getBoundingClientRect();
      dock.top = rect.top + window.scrollY;
      dock.bottom = rect.bottom + window.scrollY;
    });
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    stops = docks.map((dock) => Math.min(maxScroll,
      dock.top + Math.min(48, (dock.bottom - dock.top) * .1) - window.innerHeight * .2));
    contactHeight = document.querySelector<HTMLElement>("[data-mobile-contact-bar]")?.getBoundingClientRect().height ?? 0;
    dirty = false;
  }

  function tick(time: number) {
    frame = 0;
    if (destroyed || document.hidden || motionPreference.matches) return;
    if (dirty) measure();

    const height = window.innerHeight;
    const width = window.innerWidth;
    const mobile = width < 1024;
    const journey = stackJourney(window.scrollY, stops, Math.min(height * .57, Math.max(1, stops[0])), height * .32);
    const exit = 1 - ease((window.scrollY - docks[docks.length - 1].bottom + height * .15) / (height * .25));
    const settled = journey.progress === 0 || journey.progress === 1 || journey.from === journey.to;
    const currentProject = journey.progress === 0 ? journey.from : journey.to;

    function destination(projectIndex: number, key: string, index: number): Point {
      if (projectIndex < 0 && !mobile) {
        const homeSlot = homes.get(key)!;
        const rect = homeSlot.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
          size: homeSlot.querySelector<HTMLElement>(".stack-home-mark")?.offsetWidth ?? 30,
          rotation: (index % 5 - 2) * 5, float: 1, opacity: .9 };
      }
      const slot = projectIndex >= 0 ? docks[projectIndex].slots.get(key) : undefined;
      if (slot) {
        const rect = slot.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
          size: 24, rotation: 0, float: 0, opacity: 1 };
      }
      // Mobile parks unused icons below the viewport, invisible until a stack needs them.
      // Desktop keeps its compact waiting rows above the portrait.
      // Stable ordering comes from the generated inventory, never a hand-written stack.
      const waitingKeys = icons.filter((icon) => projectIndex < 0 || !docks[projectIndex].slots.has(icon.key)).map((icon) => icon.key);
      const waitingColumns = Math.max(1, Math.min(waitingKeys.length, Math.floor((width - 48) / 34)));
      const waitIndex = Math.max(0, waitingKeys.indexOf(key));
      const row = Math.floor(waitIndex / waitingColumns);
      const rowCount = Math.min(waitingColumns, waitingKeys.length - row * waitingColumns);
      return { x: width / 2 + (waitIndex % waitingColumns - (rowCount - 1) / 2) * 34,
        y: mobile ? height + 48 + row * 34 : height - contactHeight - 30 - row * 34,
        size: 20, rotation: (index % 3 - 1) * 4, float: mobile ? 0 : .4, opacity: mobile ? 0 : .42 };
    }

    // Read all slot geometry before writing transforms to avoid layout thrashing.
    const targets = icons.map((icon) => {
      const from = destination(journey.from, icon.key, icon.index);
      const to = destination(journey.to, icon.key, icon.index);
      const point = stackPointBetween(from, to, journey.progress);
      return { ...point, opacity: point.opacity * exit };
    });

    // Keep sampling through arrival even when mobile waiting icons have no floating motion.
    let moving = !settled;
    icons.forEach((icon, index) => {
      const target = targets[index];
      const slot = settled && currentProject >= 0 ? docks[currentProject].slots.get(icon.key) : undefined;
      if (slot) {
        // Native layout keeps the icon and label together, including compositor-driven scrolling.
        if (icon.element.parentElement !== slot) slot.append(icon.element);
        icon.element.classList.add("is-docked");
        icon.element.style.transform = "";
      } else {
        if (icon.element.parentElement !== layer) layer!.append(icon.element);
        icon.element.classList.remove("is-docked");
        // Easing comes from scroll progress alone; a second time-based filter causes scroll lag.
        const floating = target.float * Math.sin(time / 950 + icon.index * 1.7) * 5;
        icon.element.style.transform = `translate3d(${target.x - 16}px, ${target.y - 16 + floating}px, 0) rotate(${target.rotation}deg) scale(${target.size / 32})`;
        if (target.opacity > .001 && target.float > .001) moving = true;
      }
      icon.element.style.opacity = String(target.opacity);
      icon.element.dataset.stackState = settled
        ? currentProject < 0 ? "hero" : (docks[currentProject].slots.has(icon.key) ? "docked" : "waiting")
        : "traveling";
      icon.element.dataset.stackProject = settled && currentProject >= 0 ? docks[currentProject].element.id : "";
    });
    document.documentElement.classList.add("stack-motion-ready");
    if (moving) schedule();
  }

  function schedule() {
    if (!frame && !destroyed && !document.hidden && !motionPreference.matches) frame = requestAnimationFrame(tick);
  }
  function invalidate() { dirty = true; schedule(); }
  function releaseDockedIcons() {
    icons.forEach((icon) => {
      if (icon.element.parentElement !== layer) layer!.append(icon.element);
      icon.element.classList.remove("is-docked");
    });
  }
  function resetMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    releaseDockedIcons();
    document.documentElement.classList.remove("stack-motion-ready");
    invalidate();
  }
  function visibilityChanged() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else invalidate();
  }

  const resizeObserver = new ResizeObserver(invalidate);
  docks.forEach((dock) => resizeObserver.observe(dock.element));
  resizeObserver.observe(home);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", invalidate);
  motionPreference.addEventListener("change", resetMotion);
  document.addEventListener("visibilitychange", visibilityChanged);
  document.fonts.ready.then(invalidate);
  // BFCache restoration must resume motion without adding another layer or listeners.
  window.addEventListener("pageshow", invalidate);
  function destroy() {
    destroyed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", invalidate);
    window.removeEventListener("pageshow", invalidate);
    motionPreference.removeEventListener("change", resetMotion);
    document.removeEventListener("visibilitychange", visibilityChanged);
    document.documentElement.classList.remove("stack-motion-ready");
    releaseDockedIcons();
    layer?.remove();
  }
  document.addEventListener("astro:before-swap", destroy, { once: true });
  invalidate();
}
