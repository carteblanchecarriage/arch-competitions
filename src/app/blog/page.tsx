import Link from "next/link";
import { getAllPostMetas } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on architecture competitions, transparency, and the future of design.",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogPage() {
  const posts = getAllPostMetas();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Blog</h1>
        <p className="mt-3 text-lg text-gray-500">
          Thoughts on competitions, transparency, and the future of architectural practice.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {posts.map((post) => (
            <article key={post.slug} className="py-10">
              {post.image && (
                <Link href={`/blog/${post.slug}`} className="block mb-5 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt=""
                    className="w-full object-cover max-h-52 hover:opacity-90 transition-opacity"
                  />
                </Link>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-gray-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-gray-500 leading-relaxed">{post.excerpt}</p>
              <div className="mt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
