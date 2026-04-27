import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrganizerBySlug, getCompetitionsByOrganizer } from "@/data/db";
import { CompetitionCard } from "@/components/competitions/CompetitionCard";
import { formatCurrency } from "@/lib/utils";

export default async function OrganizerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [organizer, competitions] = await Promise.all([
    getOrganizerBySlug(slug),
    getCompetitionsByOrganizer(slug),
  ]);

  if (!organizer) notFound();

  const totalPrizes = competitions.reduce((sum, c) => sum + c.prizePool.totalAmount, 0);
  const openCount = competitions.filter((c) => c.status === "open").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start gap-5">
        {organizer.logo ? (
          <img
            src={organizer.logo}
            alt={organizer.name}
            className="h-16 w-16 rounded-lg object-cover bg-gray-100"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-900">
            <span className="text-xl font-bold text-white">
              {organizer.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{organizer.name}</h1>
            {organizer.isVerified && (
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {organizer.description && (
            <p className="mt-1 text-sm text-gray-500">{organizer.description}</p>
          )}
          {organizer.website && (
            <a
              href={organizer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-gray-400 hover:text-gray-700 underline decoration-gray-300"
            >
              {organizer.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{competitions.length}</div>
          <div className="text-xs text-gray-500">Competitions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {totalPrizes > 0 ? formatCurrency(totalPrizes) : "—"}
          </div>
          <div className="text-xs text-gray-500">Total Prizes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{organizer.payoutCompletionRate}%</div>
          <div className="text-xs text-gray-500">Payout Rate</div>
        </div>
      </div>

      {/* Competitions */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Competitions
            {openCount > 0 && (
              <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {openCount} open
              </span>
            )}
          </h2>
        </div>

        {competitions.length === 0 ? (
          <p className="text-sm text-gray-500">No competitions yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 border-t border-gray-100 pt-6">
        <Link href="/competitions" className="text-sm text-gray-500 hover:text-gray-900">
          ← Browse all competitions
        </Link>
      </div>
    </div>
  );
}
