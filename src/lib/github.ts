const OWNER = (process.env.GITHUB_BLOG_OWNER ?? import.meta.env.GITHUB_BLOG_OWNER ?? "haguezoum").replace(/["']/g, "");
const REPO = (process.env.GITHUB_BLOG_REPO ?? import.meta.env.GITHUB_BLOG_REPO ?? "hassan-aguezoum").replace(/["']/g, "");
const LABEL = (process.env.GITHUB_BLOG_LABEL ?? import.meta.env.GITHUB_BLOG_LABEL ?? "blog").replace(/["']/g, "");
const TOKEN = process.env.GITHUB_BLOG_TOKEN ?? import.meta.env.GITHUB_BLOG_TOKEN ?? "";

/** Resolve restricted attachments at build time; never publish this temporary URL. */
export async function resolveGitHubAttachment(src: string): Promise<string | undefined> {
  const source = new URL(src);
  if (source.origin !== "https://github.com" ||
      !/^\/user-attachments\/assets\/[a-f0-9-]+$/i.test(source.pathname)) return undefined;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "haguezoum-portfolio-blog",
  };
  // Send credentials only to the API, never to the image host or its redirects.
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const response = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      text: `![Blog image](${source.origin}${source.pathname})`,
      mode: "gfm",
      context: `${OWNER}/${REPO}`,
    }),
  });
  if (!response.ok) throw new Error(`GitHub image resolution failed (HTTP ${response.status})`);
  const html = await response.text();
  const resolved = html.match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1]?.replace(/&amp;/g, "&");
  if (!resolved) return undefined;
  const url = new URL(resolved);
  if (url.protocol !== "https:" || ![
    "private-user-images.githubusercontent.com",
    "user-images.githubusercontent.com",
    "github.com",
  ].includes(url.hostname)) return undefined;
  return url.href === source.href ? undefined : url.href;
}

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

/** Cover may be a plain URL, a pasted `<img src="...">` tag, or Markdown `![](...)`. */
export function extractCoverUrl(value: string): string | undefined {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (!trimmed || trimmed.startsWith("REPLACE_WITH")) return undefined;
  const imgTag = trimmed.match(/<img\b[^>]*\bsrc="([^"]+)"/i);
  if (imgTag) return imgTag[1];
  const mdImg = trimmed.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (mdImg) return mdImg[1];
  return trimmed;
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
    if (key.toLowerCase() === "cover") cover = extractCoverUrl(value);
  }
  if (!description) {
    const firstParagraph = rest
      .split("\n\n")
      .map((p) => p.replace(/[#>*`]/g, "").trim())
      .find((p) => p.length > 0) ?? "";
    description = firstParagraph.slice(0, 160);
  }
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

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!OWNER || !REPO) throw new Error("Missing GITHUB_BLOG_OWNER/REPO");
    const issues = await fetchIssues();
    const posts = issues.map(toBlogPost);
    posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return posts;
  } catch (error) {
    console.warn(`[blog] GitHub fetch failed, rendering empty blog: ${(error as Error).message}`);
    return [];
  }
}
