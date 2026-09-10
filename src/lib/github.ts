const OWNER = (process.env.GITHUB_BLOG_OWNER ?? import.meta.env.GITHUB_BLOG_OWNER ?? "haguezoum").replace(/["']/g, "");
const REPO = (process.env.GITHUB_BLOG_REPO ?? import.meta.env.GITHUB_BLOG_REPO ?? "hassan-aguezoum").replace(/["']/g, "");
const LABEL = (process.env.GITHUB_BLOG_LABEL ?? import.meta.env.GITHUB_BLOG_LABEL ?? "blog").replace(/["']/g, "");
const TOKEN = process.env.GITHUB_BLOG_TOKEN ?? import.meta.env.GITHUB_BLOG_TOKEN ?? "";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  cover?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  issueUrl: string;
  issueNumber: number;
}

interface GitHubLabel {
  name: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  labels: Array<string | GitHubLabel>;
  pull_request?: unknown;
  state: string;
}

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseFrontmatterComment(body: string): {
  description: string;
  cover?: string;
  rest: string;
} {
  const match = body.match(/^<!--([\s\S]*?)-->\s*/);
  if (!match) {
    const firstParagraph = body
      .split("\n\n")
      .map((p) => p.replace(/[#>*`]/g, "").trim())
      .find((p) => p.length > 0) ?? "";
    return { description: firstParagraph.slice(0, 160), rest: body };
  }
  const raw = match[1];
  const rest = body.slice(match[0].length);
  let description = "";
  let cover: string | undefined;
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_]+)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    const [, key, value] = m;
    if (key.toLowerCase() === "description") description = value;
    if (key.toLowerCase() === "cover") cover = value;
  }
  if (!description) {
    const firstParagraph = rest
      .split("\n\n")
      .map((p) => p.replace(/[#>*`]/g, "").trim())
      .find((p) => p.length > 0) ?? "";
    description = firstParagraph.slice(0, 160);
  }
  if (cover?.startsWith("REPLACE_WITH")) cover = undefined;
  return { description, cover, rest };
}

function toBlogPost(issue: GitHubIssue): BlogPost {
  const rawBody = issue.body ?? "";
  const { description, cover, rest } = parseFrontmatterComment(rawBody);
  return {
    slug: slugify(issue.title),
    title: issue.title,
    description,
    cover,
    body: rest,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  };
}

async function fetchIssues(): Promise<GitHubIssue[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=open&labels=${encodeURIComponent(LABEL)}&per_page=100`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "haguezoum-portfolio-blog",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  const data = (await response.json()) as GitHubIssue[];
  return data.filter((issue) => !issue.pull_request);
}

/** Local fixture mirroring the user's test Issue, used when the API is unreachable. */
export function getFixturePost(): BlogPost {
  const title = "Building a Blog Without a Database";
  const body = `Instead of using a database or a traditional CMS, this blog uses **GitHub Issues as the content source** and Astro generates the final pages during the build.

## Architecture

The basic flow is:

\`\`\`text
GitHub Issue
    ↓
GitHub API
    ↓
Astro Build
    ↓
Static HTML
    ↓
Vercel
\`\`\`

## Why GitHub Issues?

It gives me a simple interface for:

* writing posts
* editing posts
* Markdown
* image uploads
* labels
* version history

And the portfolio itself stays completely static.

## Code Example

\`\`\`ts
const response = await fetch(
  \`https://api.github.com/repos/\${owner}/\${repo}/issues\`,
  {
    headers: {
      Authorization: \`Bearer \${token}\`,
      Accept: "application/vnd.github+json",
    },
  }
);
\`\`\`

The GitHub API is only called during the Astro build.

## Responsive Images

Here is an image inside the article:

![Test responsive blog image](/face.webp)

Astro should automatically generate multiple WebP resolutions from this original image.

The resulting HTML should contain something similar to:

\`\`\`html
<img
  src="..."
  srcset="
    ... 320w,
    ... 640w,
    ... 960w,
    ... 1280w
  "
  sizes="..."
  loading="lazy"
  decoding="async"
  alt="Test responsive blog image"
/>
\`\`\`

## SEO Test

This article should generate its own:

* title
* meta description
* canonical URL
* Open Graph metadata
* BlogPosting JSON-LD
* sitemap entry

## Final Test

If everything works correctly, this Issue should become a page similar to:

\`\`\`text
https://haguezoum.site/blog/building-a-blog-without-a-database
\`\`\`

with all content already present in the generated HTML.`;
  return {
    slug: slugify(title),
    title,
    description:
      "Testing my new GitHub Issues powered Astro blog, including Markdown, code blocks, responsive images and SEO.",
    cover: "/face.webp",
    body,
    createdAt: "2026-09-10T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
    issueUrl: `https://github.com/${OWNER}/${REPO}/issues/1`,
    issueNumber: 1,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!OWNER || !REPO) throw new Error("Missing GITHUB_BLOG_OWNER/REPO");
    const issues = await fetchIssues();
    if (issues.length === 0) {
      console.warn("[blog] No GitHub issues found, using fixture post.");
      return [getFixturePost()];
    }
    const posts = issues.map(toBlogPost);
    posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return posts;
  } catch (error) {
    console.warn(`[blog] GitHub fetch failed, using fixture post: ${(error as Error).message}`);
    return [getFixturePost()];
  }
}
