import Link from "next/link";
import {
  getAllCompetitions,
  getLastCallCompetitions,
  getFeaturedCompetitions,
} from "@/data/db";
import { CompetitionCard } from "@/components/competitions/CompetitionCard";
import { CompetitionGrid } from "@/components/competitions/CompetitionGrid";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export default async function Home() {
  const [competitions, lastCall, featured] = await Promise.all([
    getAllCompetitions(),
    getLastCallCompetitions(),
    getFeaturedCompetitions(),
  ]);

  const stats = {
    competitions: competitions.length,
    totalPrizes: competitions.reduce((sum, c) => sum + c.prizePool.totalAmount, 0),
    payoutRate: 100,
    countries: 38,
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Architecture competitions,{" "}
              <span className="text-gray-400">done right.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl">
              Free to submit. Free to create. Transparent prize pools.
              Designers own their work. The way competitions should be.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/competitions" size="lg" variant="secondary">
                Browse Competitions
              </Button>
              <Button href="/create" size="lg" variant="ghost" className="border border-gray-500 text-white hover:bg-white/10">
                Create a Competition
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.competitions}</div>
            <div className="text-xs text-gray-500">Competitions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPrizes)}</div>
            <div className="text-xs text-gray-500">In Prizes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.payoutRate}%</div>
            <div className="text-xs text-gray-500">Payout Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.countries}+</div>
            <div className="text-xs text-gray-500">Countries</div>
          </div>
        </div>
      </section>

      {/* Last Call */}
      {lastCall.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Last Call
            </span>
            <p className="text-sm text-gray-500">Closing soon — don&apos;t miss out</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lastCall.map((c) => (
              <CompetitionCard key={c.id} competition={c} compact />
            ))}
          </div>
        </section>
      )}

      {/* Featured Competitions */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Featured Competitions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              High-impact opportunities with significant prize pools
            </p>
          </div>
          <Link
            href="/competitions"
            className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block"
          >
            View all &rarr;
          </Link>
        </div>
        <CompetitionGrid competitions={featured} />
        <div className="mt-6 text-center sm:hidden">
          <Button href="/competitions" variant="outline" size="sm">
            View all competitions
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            How It Works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
            A platform that aligns incentives. We take 5% at payout — we only succeed when competitions succeed.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* For Designers */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">For Designers</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-500">&#10003;</span>
                  Always free to submit
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-500">&#10003;</span>
                  You own your work — strong IP protections
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-500">&#10003;</span>
                  Verified prize pools — see the money before you start
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-emerald-500">&#10003;</span>
                  Follow the story — competitions lead to real outcomes
                </li>
              </ul>
            </div>

            {/* For Organizers */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">For Organizers</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="mt-1 text-blue-500">&#10003;</span>
                  Free to create — fund the prize, not a listing fee
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-blue-500">&#10003;</span>
                  Quality templates make great briefs easy
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-blue-500">&#10003;</span>
                  Open prize pools attract more funding
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-blue-500">&#10003;</span>
                  Build your reputation with verified payouts
                </li>
              </ul>
            </div>

            {/* For Contributors */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">For Contributors</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="mt-1 text-purple-500">&#10003;</span>
                  Fund competitions you believe in
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-purple-500">&#10003;</span>
                  Bigger pools attract better ideas
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-purple-500">&#10003;</span>
                  See real-world impact of your contribution
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-purple-500">&#10003;</span>
                  Transparent — every dollar is tracked
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Ready to rethink architecture competitions?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Whether you&apos;re submitting designs, creating competitions, or funding ideas
          that matter — this is the platform built for you.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/competitions" size="lg">Browse Competitions</Button>
          <Button href="/create" size="lg" variant="outline">Create a Competition</Button>
        </div>
      </section>
    </>
  );
}
