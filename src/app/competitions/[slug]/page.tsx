import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompetitionBySlug, getAllSlugs } from "@/data/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TYPE_LABELS, ELIGIBILITY_LABELS, STATUS_CONFIG } from "@/lib/constants";
import { formatCurrency, formatDate, formatDeadline, daysUntil, cn } from "@/lib/utils";
import type { Competition } from "@/data/types";
import { FundCompetitionPanel } from "@/components/detail/FundCompetitionPanel";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // For static export we need to do this synchronously via the competitions array
  return {
    title: "Competition Detail",
  };
}

function formatPercent(value: number): string {
  return value % 1 === 0 ? `${value}%` : `${value.toFixed(1)}%`;
}

function PrizePoolDisplay({ competition: c }: { competition: Competition }) {
  const { prizePool } = c;
  const { isOpenPool, totalAmount, platformFeePercent, netToWinners, breakdown } = prizePool;

  // For open pool, show each tier's share of the winner pool.
  // Prefer prizeShareBps (set at creation); fall back to breakdown amounts or equal split.
  const tierPercents = isOpenPool
    ? (c.prizeShareBps?.length
        ? c.prizeShareBps.map((bps) => bps / 100)
        : (() => {
            const total = breakdown.reduce((s, b) => s + b.amount, 0);
            return breakdown.map((b) =>
              total > 0 ? (b.amount / total) * 100 : 100 / breakdown.length
            );
          })())
    : breakdown.map((b) => (totalAmount > 0 ? (b.amount / totalAmount) * 100 : 0));

  // Sanity check: breakdown should sum to netToWinners (within $1 rounding tolerance).
  const breakdownSum = breakdown.reduce((sum, b) => sum + b.amount, 0);
  const breakdownMismatch =
    totalAmount > 0 && Math.abs(breakdownSum - netToWinners) > 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Prize Pool</h2>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-gray-900">
          {isOpenPool ? "Open" : formatCurrency(totalAmount)}
        </span>
        {isOpenPool && (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
            Open Pool
          </span>
        )}
      </div>

      {isOpenPool && (
        <p className="mt-1 text-xs text-gray-400">
          Pool grows as contributors add funds. Prize splits are fixed percentages.
        </p>
      )}

      {breakdownMismatch && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Prize breakdown ({formatCurrency(breakdownSum)}) does not match net to winners ({formatCurrency(netToWinners)}). Check competition data.
        </div>
      )}

      {/* Breakdown */}
      <div className="mt-4 space-y-2">
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {b.place}
              {b.recipientName && (
                <span className="ml-1 text-gray-400">— {b.recipientName}</span>
              )}
            </span>
            {isOpenPool ? (
              <span className="font-semibold text-gray-900">
                {formatPercent(tierPercents[i])}
              </span>
            ) : (
              <span className="font-semibold text-gray-900">{formatCurrency(b.amount)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Platform fee transparency */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Platform fee</span>
          <span className="text-gray-500">
            {isOpenPool
              ? formatPercent(platformFeePercent)
              : formatCurrency(totalAmount - netToWinners)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-gray-900">Net to winners</span>
          <span className="text-gray-900">
            {isOpenPool
              ? formatPercent(100 - platformFeePercent)
              : formatCurrency(netToWinners)}
          </span>
        </div>
      </div>

      {/* Funding status */}
      <div className="mt-4 flex items-center gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          prizePool.fundingStatus === "paid_out"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-blue-50 text-blue-700"
        )}>
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {prizePool.fundingStatus === "paid_out" ? "Paid Out" : "Verified & Escrowed"}
        </span>
        {prizePool.paidOutDate && (
          <span className="text-xs text-gray-400">on {formatDate(prizePool.paidOutDate)}</span>
        )}
      </div>

      {isOpenPool && (
        <div className="mt-4">
          <div className="text-xs text-gray-500">{prizePool.contributorCount} contributors</div>
          <FundCompetitionPanel escrowAddress={c.escrowAddress} />
        </div>
      )}
    </div>
  );
}

function TimelineVisual({ competition: c }: { competition: Competition }) {
  const stages = [
    { key: "open", label: "Submissions Open", date: c.registrationDeadline },
    { key: "deadline", label: "Deadline", date: c.submissionDeadline },
    { key: "judging", label: "Judging", date: c.judgingStart },
    { key: "announced", label: "Announcement", date: c.announcementDate },
  ];

  const statusOrder = ["open", "judging", "announced"];
  const currentIndex = statusOrder.indexOf(c.status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Timeline</h2>
      <div className="mt-4 space-y-4">
        {stages.map((stage, i) => {
          const isPast = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={stage.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  isPast ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white",
                  isCurrent && "ring-2 ring-emerald-200"
                )}>
                  {isPast && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {i < stages.length - 1 && (
                  <div className={cn("mt-1 h-6 w-0.5", isPast ? "bg-emerald-500" : "bg-gray-200")} />
                )}
              </div>
              <div>
                <div className={cn("text-sm font-medium", isPast ? "text-gray-900" : "text-gray-500")}>
                  {stage.label}
                </div>
                <div className="text-xs text-gray-400">{formatDate(stage.date)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function CompetitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);

  if (!competition) {
    notFound();
  }

  const c = competition;
  const isOpen = c.status === "open";
  const hasResults = !!c.results;
  const urgent = isOpen && daysUntil(c.submissionDeadline) <= 7;

  return (
    <article>
      {/* Hero */}
      <div className="relative h-64 overflow-hidden bg-gray-900 sm:h-80 lg:h-96">
        <img
          src={c.heroImage}
          alt={c.title}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <StatusBadge status={c.status} className="mb-3" />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{c.title}</h1>
          <p className="mt-2 max-w-2xl text-gray-300">{c.shortDescription}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Quick info bar */}
            <div className="flex flex-wrap gap-2">
              <Tag variant="type">{TYPE_LABELS[c.type]}</Tag>
              <Tag variant="eligibility">{ELIGIBILITY_LABELS[c.eligibility]}</Tag>
              {c.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>

            {/* Deadline alert */}
            {isOpen && (
              <div className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3",
                urgent ? "bg-red-50" : "bg-blue-50"
              )}>
                <svg className={cn("h-5 w-5", urgent ? "text-red-500" : "text-blue-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className={cn("text-sm font-semibold", urgent ? "text-red-700" : "text-blue-700")}>
                    {formatDeadline(c.submissionDeadline)}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    Submission deadline: {formatDate(c.submissionDeadline)}
                  </span>
                </div>
              </div>
            )}

            {/* Brief */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Brief</h2>
              <div className="mt-3 space-y-4 text-sm leading-relaxed text-gray-600 [&>p]:whitespace-pre-line">
                {c.brief.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* Design Objectives */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Design Objectives</h2>
              <ul className="mt-3 space-y-2">
                {c.designObjectives.map((obj, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 text-gray-400">{i + 1}.</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </section>

            {/* Site Context */}
            {c.siteContext && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900">Site Context</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{c.siteContext}</p>
              </section>
            )}

            {/* Attachments */}
            {(c.attachments ?? []).length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900">Brief Downloads</h2>
                <div className="mt-3 space-y-2">
                  {(c.attachments ?? []).map((file, i) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                    >
                      <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="flex-1 font-medium text-gray-900">{file.name}</span>
                      {file.size && (
                        <span className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Jury */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Jury</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {c.jury.map((member, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-gray-100 p-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                      {member.photo && (
                        <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.title}, {member.organization}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Evaluation Criteria */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Evaluation Criteria</h2>
              <div className="mt-4 space-y-3">
                {c.evaluationCriteria.map((criterion, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{criterion.name}</span>
                      <span className="text-gray-500">{criterion.weight}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gray-800"
                        style={{ width: `${criterion.weight}%` }}
                      />
                    </div>
                    {criterion.description && (
                      <p className="mt-0.5 text-xs text-gray-400">{criterion.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Deliverables */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Deliverables</h2>
              <div className="mt-3 space-y-2">
                {c.deliverables.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{d.type}</div>
                      <div className="text-xs text-gray-500">
                        {[d.format, d.dimensions, d.maxSize].filter(Boolean).join(" · ")}
                      </div>
                      {d.description && <p className="mt-0.5 text-xs text-gray-400">{d.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* IP Terms */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                Rights & IP
                {c.ipTerms.warningLevel === "caution" && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Review Carefully</span>
                )}
              </h2>
              <div className={cn(
                "mt-3 rounded-lg border p-4",
                c.ipTerms.warningLevel === "none" && "border-emerald-200 bg-emerald-50",
                c.ipTerms.warningLevel === "info" && "border-blue-200 bg-blue-50",
                c.ipTerms.warningLevel === "caution" && "border-amber-200 bg-amber-50",
              )}>
                <div className={cn(
                  "text-sm font-medium",
                  c.ipTerms.warningLevel === "none" && "text-emerald-800",
                  c.ipTerms.warningLevel === "info" && "text-blue-800",
                  c.ipTerms.warningLevel === "caution" && "text-amber-800",
                )}>
                  {c.ipTerms.summary}
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    View full terms
                  </summary>
                  <p className="mt-2 text-xs text-gray-600">{c.ipTerms.fullText}</p>
                </details>
              </div>
            </section>

            {/* Results */}
            {hasResults && c.results && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900">Results</h2>
                {c.results.jurySummary && (
                  <p className="mt-2 text-sm italic text-gray-500">{c.results.jurySummary}</p>
                )}
                <div className="mt-4 space-y-6">
                  {c.results.winners.map((winner, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-gray-200">
                      {winner.images.length > 0 && (
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                          <img src={winner.images[0]} alt={winner.projectTitle} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">{winner.place}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(winner.prizeAmount)}</span>
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-gray-900">{winner.projectTitle}</h3>
                        <p className="text-sm text-gray-500">
                          by{" "}
                          {winner.submitterSlug ? (
                            <Link href={`/submitters/${winner.submitterSlug}`} className="text-gray-900 underline decoration-gray-300 hover:decoration-gray-900">
                              {winner.designerName}
                            </Link>
                          ) : (
                            winner.designerName
                          )}
                          {winner.designerOrg && `, ${winner.designerOrg}`}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">{winner.description}</p>
                        {winner.juryStatement && (
                          <blockquote className="mt-3 border-l-2 border-gray-300 pl-3 text-sm italic text-gray-500">
                            &ldquo;{winner.juryStatement}&rdquo;
                          </blockquote>
                        )}
                        {winner.paidOut && (
                          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Prize Paid Out {winner.paidOutDate && `on ${formatDate(winner.paidOutDate)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Lifecycle Updates */}
            {c.updates && c.updates.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900">Story Updates</h2>
                <div className="mt-4 space-y-4">
                  {c.updates.map((update, i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-4">
                      <div className="text-xs text-gray-400">{formatDate(update.date)}</div>
                      <div className="text-xs text-gray-500">by {update.author}</div>
                      <h3 className="mt-1 text-sm font-semibold text-gray-900">{update.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{update.content}</p>
                      {update.newStatus && (
                        <StatusBadge status={update.newStatus} className="mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full flex-shrink-0 space-y-6 lg:w-80">
            {/* Actions */}
            {isOpen && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <Button className="w-full" size="lg" disabled>
                  Submit Entry (Coming Soon)
                </Button>
                <p className="mt-2 text-center text-xs text-gray-400">
                  Free to submit, always
                </p>
              </div>
            )}

            <PrizePoolDisplay competition={c} />
            <TimelineVisual competition={c} />

            {/* Organizer */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Organizer</h2>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/organizers/${c.organizer.slug}`}
                    className="font-semibold text-gray-900 hover:underline decoration-gray-300"
                  >
                    {c.organizer.name}
                  </Link>
                  {c.organizer.isVerified && (
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{c.organizer.description}</p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>{c.organizer.competitionsCount} competitions</span>
                  <span>{c.organizer.payoutCompletionRate}% payout rate</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Details</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900">{c.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Language</dt>
                  <dd className="font-medium text-gray-900">{c.language}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Registration</dt>
                  <dd className="font-medium text-gray-900">{formatDate(c.registrationDeadline)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Submission</dt>
                  <dd className="font-medium text-gray-900">{formatDate(c.submissionDeadline)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Announcement</dt>
                  <dd className="font-medium text-gray-900">{formatDate(c.announcementDate)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
