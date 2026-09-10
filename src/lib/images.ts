import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTHS = [320, 640, 960, 1280];
const OUTPUT_DIR = "/blog/";

// process.cwd() is the repo root both in dev and during `astro build`
// (import.meta.url points into Vite's bundle at build time, so it can't
// be used to locate public/).
const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, "public");
const distDir = path.join(repoRoot, "dist");

function outputDirs(): string[] {
  const dirs = [path.join(publicDir, "blog")];
  // Files written to public/ during route generation are NOT re-copied to
  // dist/, so mirror the variants into dist/ when it exists (i.e. builds).
  if (existsSync(distDir)) dirs.push(path.join(distDir, "blog"));
  return dirs;
}

function hashName(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 10);
}

async function loadSourceBuffer(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      // GitHub attachment URLs (github.com/user-attachments/...) 302-redirect
      // to expiring signed S3 URLs. fetch follows the redirect and grabs fresh
      // bytes now, so the built site never depends on the expiring link.
      const res = await fetch(src, {
        headers: { Accept: "image/*", "User-Agent": "haguezoum-portfolio-blog" },
        redirect: "follow",
      });
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/")) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    const localPath = path.join(publicDir, src.split("?")[0].replace(/^\//, ""));
    return await readFile(localPath);
  } catch {
    return null;
  }
}

export interface LocalizedImage {
  /** Local self-hosted fallback (largest generated variant). */
  src: string;
  srcset: string;
}

/**
 * Download `src` (following GitHub's signed-URL redirects), generate
 * 320/640/960/1280 WebP variants under /blog/, and return their local URLs.
 * Returns null when the source can't be fetched — callers must fall back to
 * the remote URL so a bad upload never breaks the build.
 */
export async function localizeImage(src: string, slug: string): Promise<LocalizedImage | null> {
  if (src.startsWith("data:") || src.includes("REPLACE_WITH")) return null;
  const buffer = await loadSourceBuffer(src);
  if (!buffer) {
    if (src.startsWith("http")) {
      console.warn(
        `[blog] Could not download image for "${slug}": ${src.slice(0, 100)} — ` +
          `page will hotlink it instead. Fix the URL in the GitHub Issue (use the Markdown URL GitHub inserts on upload).`,
      );
    }
    return null;
  }
  try {
    for (const dir of outputDirs()) await mkdir(dir, { recursive: true });
    const base = `${slug}-${hashName(src)}`;
    const srcset: string[] = [];
    let largest = "";
    for (const width of WIDTHS) {
      const fileName = `${base}-${width}.webp`;
      const resized = await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      for (const dir of outputDirs()) await writeFile(path.join(dir, fileName), resized);
      const url = `${OUTPUT_DIR}${fileName}`;
      srcset.push(`${url} ${width}w`);
      if (width === 960) largest = url;
    }
    const origName = `${base}-orig.webp`;
    const origBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer();
    for (const dir of outputDirs()) await writeFile(path.join(dir, origName), origBuffer);
    if (!largest) largest = `${OUTPUT_DIR}${origName}`;
    return { src: largest, srcset: srcset.join(", ") };
  } catch (error) {
    console.warn(`[blog] image optimization failed for ${src}: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Generate 320/640/960/1280 WebP variants for an image and return a
 * responsive <img> tag string. Never throws: on any failure it returns a
 * plain <img> pointing at the original src so the build can't break.
 */
export async function responsiveImgTag(
  _originalTag: string,
  src: string,
  alt: string,
  slug: string,
  imgClass = "",
  loading: "lazy" | "eager" = "lazy",
): Promise<string> {
  const safeAlt = (alt || "Blog image").replace(/"/g, "&quot;");
  const classAttr = imgClass ? ` class="${imgClass}"` : "";
  const fallback = `<img src="${src}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 960px" loading="${loading}" decoding="async" alt="${safeAlt}"${classAttr} />`;
  const localized = await localizeImage(src, slug);
  if (!localized) return fallback;
  return `<img src="${localized.src}" srcset="${localized.srcset}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 960px" loading="${loading}" decoding="async" alt="${safeAlt}"${classAttr} />`;
}

/** Replace every <img> in rendered HTML with a responsive variant. */
export async function enhanceImages(html: string, slug: string): Promise<string> {
  const imgRe = /<img\b[^>]*>/g;
  const matches = html.match(imgRe) ?? [];
  let output = html;
  for (const tag of matches) {
    const srcMatch = tag.match(/\ssrc="([^"]+)"/);
    const altMatch = tag.match(/\salt="([^"]*)"/);
    if (!srcMatch) continue;
    const replacement = await responsiveImgTag(tag, srcMatch[1], altMatch?.[1] ?? "", slug);
    output = output.replace(tag, replacement);
  }
  return output;
}
