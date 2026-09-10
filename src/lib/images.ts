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
      const res = await fetch(src);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    const localPath = path.join(publicDir, src.split("?")[0].replace(/^\//, ""));
    return await readFile(localPath);
  } catch {
    return null;
  }
}

/**
 * Generate 320/640/960/1280 WebP variants for an image and return a
 * responsive <img> tag string. Falls back to the original tag on failure.
 */
export async function responsiveImgTag(_originalTag: string, src: string, alt: string, slug: string): Promise<string> {
  const safeAlt = (alt || "Blog image").replace(/"/g, "&quot;");
  const fallback = `<img src="${src}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 960px" loading="lazy" decoding="async" alt="${safeAlt}" />`;
  // Skip data URIs and placeholders that were never replaced with real uploads.
  if (src.startsWith("data:") || src.includes("REPLACE_WITH")) return fallback;

  const buffer = await loadSourceBuffer(src);
  if (!buffer) return fallback;

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
    // Persist original as well for the `src` fallback.
    const origName = `${base}-orig.webp`;
    const origBuffer = await sharp(buffer).webp({ quality: 82 }).toBuffer();
    for (const dir of outputDirs()) await writeFile(path.join(dir, origName), origBuffer);
    const origUrl = `${OUTPUT_DIR}${origName}`;
    if (!largest) largest = origUrl;
    return `<img src="${largest}" srcset="${srcset.join(", ")}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 960px" loading="lazy" decoding="async" alt="${safeAlt}" />`;
  } catch (error) {
    console.warn(`[blog] image optimization failed for ${src}: ${(error as Error).message}`);
    return fallback;
  }
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
