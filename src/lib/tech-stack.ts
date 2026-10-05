// SVGs copied directly from https://www.tech-stack-icons.com/ (dark variant).
// Keep aliases here; project tags remain the source of truth for the animation.
const iconNames: Record<string, string> = {
  nextjs: "nextjs2",
  typescript: "typescript",
  tailwindcss: "tailwindcss",
  shadcnui: "shadcnui",
  docker: "docker",
  nodejs: "nodejs",
  javascript: "js",
  js: "js",
  djangorest: "django",
  django: "django",
  postgresql: "postgresql",
  prisma: "prisma",
  react: "react",
  reactquery: "reactquery",
  vite: "vite",
  videojs: "videojs",
  hlsjs: "hlsjs",
  ffmpeg: "ffmpeg",
  webcomponents: "webcomponents",
  restapi: "restapi",
  restapis: "restapi",
  nestjs: "nestjs",
  swagger: "swagger",
  vuejs: "vuejs",
  git: "git",
  bash: "bash",
  cplusplus: "cplusplus",
  c: "c",
  algorithms: "algorithm",
};

export function technologyFor(tag: string) {
  const normalized = tag.toLowerCase().replace(/\+\+/g, "plusplus").replace(/[^a-z0-9]/g, "");
  const key = iconNames[normalized] ?? normalized;
  return {
    key,
    label: tag,
    src: iconNames[normalized] ? `/icons/tech-stack/${key}.svg` : null,
    mark: normalized.slice(0, 2).toUpperCase(),
  };
}

export type Technology = ReturnType<typeof technologyFor>;
