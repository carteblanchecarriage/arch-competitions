import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompetitionBySlug } from "@/data/db";
import { SubmitEntryForm } from "@/components/competitions/SubmitEntryForm";

export const dynamic = "force-dynamic";

export default async function SubmitEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug).catch(() => null);
  if (!competition) notFound();

  const deadlinePassed = new Date(competition.submissionDeadline) < new Date();
  const isOpen = competition.status === "open" && !deadlinePassed;

  if (!isOpen) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Submissions closed</h1>
        <p className="mt-3 text-gray-500">
          {competition.status !== "open"
            ? "This competition is no longer accepting entries."
            : "The submission deadline has passed."}
        </p>
        <Link
          href={`/competitions/${slug}`}
          className="mt-6 inline-block text-sm text-gray-500 underline decoration-gray-300 hover:text-gray-900"
        >
          ← Back to competition
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Link
          href={`/competitions/${slug}`}
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          ← {competition.title}
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Submit entry</h1>
      </div>
      <SubmitEntryForm competition={competition} />
    </main>
  );
}
