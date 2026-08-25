import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc, getAllDocMetas, getAllDocSlugs } from "@/lib/docs";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const [doc, allDocs] = await Promise.all([getDoc(slug), Promise.resolve(getAllDocMetas())]);
  if (!doc) notFound();

  const currentIndex = allDocs.findIndex((d) => d.slug === slug);
  const prev = allDocs[currentIndex - 1] ?? null;
  const next = allDocs[currentIndex + 1] ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-screen gap-12 py-12">

        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">
              Developer Docs
            </p>
            <nav className="mt-4 space-y-0.5">
              {allDocs.map((d) => (
                <Link
                  key={d.slug}
                  href={`/docs/${d.slug}`}
                  className={cn(
                    "block py-1.5 text-sm transition-colors",
                    d.slug === slug
                      ? "font-semibold text-[#111]"
                      : "text-gray-400 hover:text-[#111]"
                  )}
                >
                  {d.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {/* Mobile nav */}
          <div className="mb-8 lg:hidden">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">
              Developer Docs
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {allDocs.map((d) => (
                <Link
                  key={d.slug}
                  href={`/docs/${d.slug}`}
                  className={cn(
                    "text-sm",
                    d.slug === slug ? "font-semibold text-[#111]" : "text-gray-400 hover:text-[#111]"
                  )}
                >
                  {d.title}
                </Link>
              ))}
            </div>
          </div>

          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">
            {String(currentIndex + 1).padStart(2, "0")} / {String(allDocs.length).padStart(2, "0")}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-[#111]">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="mt-3 text-lg text-gray-500">{doc.description}</p>
          )}
          <div className="mt-2 border-t border-gray-200" />

          <div
            className="prose mt-8"
            dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
          />

          {/* Prev / Next */}
          <div className="mt-16 flex items-center justify-between border-t border-gray-200 pt-6">
            {prev ? (
              <Link
                href={`/docs/${prev.slug}`}
                className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400 hover:text-[#111]"
              >
                ← {prev.title}
              </Link>
            ) : <span />}
            {next ? (
              <Link
                href={`/docs/${next.slug}`}
                className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400 hover:text-[#111]"
              >
                {next.title} →
              </Link>
            ) : <span />}
          </div>
        </main>
      </div>
    </div>
  );
}
