import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { codeToHtml, createHighlighter, type Highlighter } from "shiki";
import { enhanceImages } from "./images.ts";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: ["ts", "typescript", "js", "html", "text", "bash", "json", "tsx"],
    });
  }
  return highlighterPromise;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function highlightCodeBlocks(html: string): Promise<string> {
  const re = /<pre><code class="language-([\w+-]+)">([\s\S]*?)<\/code><\/pre>/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const highlighter = await getHighlighter();

  const normalizeLang = (lang: string) => {
    if (lang === "ts") return "typescript";
    if (lang === "js") return "javascript";
    return highlighter.getLoadedLanguages().includes(lang) ? lang : "text";
  };

  while ((match = re.exec(html)) !== null) {
    parts.push(html.slice(lastIndex, match.index));
    const [, lang, encoded] = match;
    try {
      parts.push(
        await codeToHtml(decodeEntities(encoded), {
          lang: normalizeLang(lang),
          theme: "github-dark",
        }),
      );
    } catch {
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }
  parts.push(html.slice(lastIndex));
  return parts.join("");
}

export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Render GitHub Issue Markdown to sanitized, highlighted, responsive HTML. */
export async function renderMarkdown(markdown: string, slug: string): Promise<string> {
  const raw = await marked.parse(markdown, { gfm: true, breaks: false });
  const highlighted = await highlightCodeBlocks(typeof raw === "string" ? raw : "");
  const responsive = await enhanceImages(highlighted, slug);
  return sanitizeHtml(responsive, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "span", "pre", "figure", "figcaption"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "style", "id"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding", "fetchpriority"],
      code: ["class"],
      pre: ["class", "style", "tabindex"],
      span: ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
