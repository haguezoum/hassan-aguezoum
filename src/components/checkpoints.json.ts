export interface Checkpoint {
    id: number;
    dateRange: string;
    title: string;
    organization: string;
    type: "Education" | "Work";
    summary: string;
    details: string[];
    techSkills: string[];
    link: string;
}

export const checkpoints: Checkpoint[] = [
    {
        id: 1,
        dateRange: "2026 – Present",
        title: "Founder & Product Engineer",
        organization: "Tabib — Independent",
        type: "Work",
        summary:
            "Building a healthcare scheduling platform with a patient booking flow and a doctor dashboard.",
        details: [
            "Designed doctor onboarding, booking, authentication, and trial-conversion workflows across mobile and desktop",
            "Defined analytics events for visitor, call-to-action, and authentication funnels",
            "Shipped with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Docker",
        ],
        techSkills: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Docker"],
        link: "https://mytabib.me",
    },
    {
        id: 2,
        dateRange: "Oct 2025 – Present",
        title: "Frontend-Focused Full-Stack Developer",
        organization: "Confidential Client Platform — Contract / Remote",
        type: "Work",
        summary:
            "Developing end-to-end SaaS features with Next.js and NestJS as part of a two-developer team.",
        details: [
            "Building reusable TypeScript UI components and integrating Swagger-documented REST endpoints",
            "Contributing to architecture decisions, API integration, and feature delivery through review",
        ],
        techSkills: ["Next.js", "NestJS", "TypeScript", "REST APIs", "Swagger"],
        link: "",
    },
    {
        id: 3,
        dateRange: "Apr 2025 – Oct 2025",
        title: "Frontend Developer",
        organization: "Infinitive Byte — Tetouan, Morocco",
        type: "Work",
        summary:
            "Built responsive Next.js interfaces and reusable components for a SaaS product.",
        details: [
            "Integrated Django REST APIs and handled data-fetching states",
            "Supported Docker-based delivery workflows",
        ],
        techSkills: ["Next.js", "Django REST", "TypeScript", "Docker"],
        link: "",
    },
    {
        id: 4,
        dateRange: "Sep 2022 – Present",
        title: "Software Engineering Program",
        organization: "1337 Coding School – 42 Network — Tetouan, Morocco",
        type: "Education",
        summary:
            "Project-based, peer-to-peer curriculum covering systems, web, and team delivery.",
        details: [
            "C, C++, algorithms, networking, operating systems, web engineering, Git, and Docker",
            "Developed systems and full-stack projects through team delivery, code reviews, and technical evaluations",
        ],
        techSkills: ["C", "C++", "Algorithms", "Docker", "Git"],
        link: "https://1337.ma/en/",
    },
    {
        id: 5,
        dateRange: "Apr 2021 – Sep 2021",
        title: "Frontend Developer Intern",
        organization: "AJICOD — Agadir, Morocco",
        type: "Work",
        summary:
            "Built responsive client-facing interfaces with Vue.js and Tailwind CSS.",
        details: [
            "Collaborated through Git- and GitHub-based workflows",
        ],
        techSkills: ["Vue.js", "Tailwind CSS", "Git"],
        link: "",
    },
];
