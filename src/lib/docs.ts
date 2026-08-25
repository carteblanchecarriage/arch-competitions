import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const DOCS_DIR = path.join(process.cwd(), "docs");

export interface DocMeta {
  slug: string;
  title: string;
  order: number;
  description: string;
}

export interface Doc extends DocMeta {
  contentHtml: string;
}

function isDoc(filename: string) {
  return filename.endsWith(".md") && !filename.startsWith("_");
}

export function getAllDocMetas(): DocMeta[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter(isDoc)
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(DOCS_DIR, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        order: data.order ?? 99,
        description: data.description ?? "",
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getAllDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs.readdirSync(DOCS_DIR).filter(isDoc).map((f) => f.replace(/\.md$/, ""));
}

export async function getDoc(slug: string): Promise<Doc | null> {
  const filepath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html, { allowDangerousHtml: true }).process(content);
  return {
    slug,
    title: data.title ?? slug,
    order: data.order ?? 99,
    description: data.description ?? "",
    contentHtml: processed.toString(),
  };
}
