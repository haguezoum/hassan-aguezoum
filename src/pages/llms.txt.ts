import type { APIRoute } from "astro";

import { projects } from "../components/projects.json";

const createLlmsTxt = (site: URL) => {
  const portfolioURL = new URL("/", site);
  const sectionURL = (section: string) => new URL(`/#${section}`, site).href;
  const projectLinks = projects
    .map((project) => {
      const href = project.url || project.repo;
      return href ? `- [${project.name}](${href}): ${project.description}` : null;
    })
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return `# Hassan Aguezoum

> Portfolio of Hassan Aguezoum, a frontend engineer and 1337 Coding School student in Morocco who builds SaaS dashboards and API-driven products.

Hassan works primarily with React, Next.js, TypeScript, REST APIs, Tailwind CSS, and Docker. He is available for remote EMEA roles and worldwide contract work in Arabic, English, and French.

## Portfolio

- [Portfolio homepage](${portfolioURL.href}): Professional overview, selected work, experience, education, and contact links.
- [About Hassan](${sectionURL("about")}): Background, engineering focus, current work, location, and availability.
- [Selected projects](${sectionURL("projects")}): Frontend and full-stack products with live deployments, source links, technology stacks, and project summaries.
- [Experience and education](${sectionURL("checkpoints")}): Professional roles and project-based software engineering education at 1337 Coding School in the 42 Network.

## Selected projects

${projectLinks}

## Professional profiles

- [GitHub](https://github.com/haguezoum): Public source code and engineering projects.
- [LinkedIn](https://linkedin.com/in/hassan-aguezoum): Professional profile and work history.
- [X](https://x.com/hassan_aguezoum): Hassan's public social profile.
`;
};

export const GET: APIRoute = ({ site, url }) => {
  const siteURL = site ?? new URL(url.origin);

  return new Response(createLlmsTxt(siteURL), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
