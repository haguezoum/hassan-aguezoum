export interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  repo: string;
  tags: string[];
  image: string;
}

export const projects: Project[] = [
  {
    id: 1,
    name: "Tabib",
    description:
      "Healthcare scheduling platform with a mobile-friendly patient booking flow and a doctor dashboard for availability and appointments. Covers onboarding, authentication, trial conversion, and funnel analytics.",
    url: "https://tabib.haguezoum.site",
    repo: "",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Docker"],
    image: "",
  },
  {
    id: 2,
    name: "Study in China",
    description:
      "Frontend dashboard for universities, majors, and academic paths with API-driven search, dynamic filtering, and structured navigation.",
    url: "https://dashboard.greatwall.ma/programs",
    repo: "",
    tags: ["Next.js", "TypeScript", "REST APIs", "Vercel"],
    image: "",
  },
  {
    id: 3,
    name: "CSCA Exam Simulator",
    description:
      "Exam-preparation interface with realistic test flows and protected HLS video playback for learning content.",
    url: "https://dashboard.greatwall.ma/csca",
    repo: "",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    image: "",
  },
  {
    id: 4,
    name: "Messa Pong",
    description:
      "Online Pong SPA with real-time chat, authentication, and backend services. Led frontend work in a five-person team.",
    url: "",
    repo: "https://github.com/haguezoum/Messa-Pong",
    tags: ["Web Components", "Django REST", "PostgreSQL", "Docker"],
    image: "",
  },
];
