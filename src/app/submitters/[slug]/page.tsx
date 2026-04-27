import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSubmitterBySlug,
  getAllSubmitterSlugs,
  getAllCompetitions,
} from "@/data/db";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { EditProfileButton } from "@/components/auth/EditProfileButton";

export async function generateStaticParams() {
  const slugs = await getAllSubmitterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export function generateMetadata() {
  return {
    title: "Designer Profile — Arch Competitions",
  };
}

export default async function SubmitterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [submitter, competitions] = await Promise.all([
    getSubmitterBySlug(slug),
    getAllCompetitions(),
  ]);
  if (!submitter) notFound();

  // Find competitions this submitter has won or been involved in
  const competitionHistory = competitions
    .filter((c) =>
      c.results?.winners.some((w) => w.submitterSlug === submitter.slug)
    )
    .map((c) => {
      const winnerEntry = c.results!.winners.find(
        (w) => w.submitterSlug === submitter.slug
      )!;
      return { competition: c, entry: winnerEntry };
    });

  const totalPrizeWon = competitionHistory.reduce(
    (sum, h) => sum + h.entry.prizeAmount,
    0
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        {submitter.photo && (
          <img
            src={submitter.photo}
            alt={submitter.name}
            className="h-24 w-24 rounded object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {submitter.name}
            </h1>
            <EditProfileButton slug={submitter.slug} />
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
              {submitter.type}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {submitter.city ? `${submitter.city}, ` : ""}
            {submitter.country}
            {submitter.yearEstablished &&
              ` · Est. ${submitter.yearEstablished}`}
          </p>
          <p className="mt-3 text-gray-700">{submitter.bio}</p>
          {submitter.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {submitter.specialties.map((s) => (
                <Tag key={s} variant="default">
                  {s}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {competitionHistory.length}
          </p>
          <p className="text-xs text-gray-500">
            Competition{competitionHistory.length !== 1 ? "s" : ""} Won
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalPrizeWon)}
          </p>
          <p className="text-xs text-gray-500">Total Prizes</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {new Set(competitionHistory.map((h) => h.competition.region)).size}
          </p>
          <p className="text-xs text-gray-500">Regions</p>
        </div>
      </div>

      {/* Competition History */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Competition History
        </h2>
        <div className="mt-4 space-y-4">
          {competitionHistory.map(({ competition, entry }) => (
            <Link
              key={competition.id}
              href={`/competitions/${competition.slug}`}
              className="block overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex">
                <div className="hidden w-48 shrink-0 sm:block">
                  <img
                    src={competition.thumbnailImage}
                    alt={competition.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={competition.status} />
                    <span className="text-xs font-semibold text-gray-900">
                      {entry.place}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-gray-900">
                    {competition.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {entry.projectTitle}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(entry.prizeAmount)}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">
                      {competition.location}
                    </span>
                    {entry.paidOut && (
                      <>
                        <span className="text-gray-400">·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Paid
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {competitionHistory.length === 0 && (
            <p className="text-sm text-gray-500">
              No competition results yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
