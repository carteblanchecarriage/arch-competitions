import Link from "next/link";
import {
  getLastCallCompetitions,
  getFeaturedCompetitions,
} from "@/data/db";
import { CompetitionCard } from "@/components/competitions/CompetitionCard";
import { CompetitionGrid } from "@/components/competitions/CompetitionGrid";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const [lastCall, featured] = await Promise.all([
    getLastCallCompetitions().catch(() => []),
    getFeaturedCompetitions().catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden grain-gradient text-gray-950">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.02em] text-gray-950 sm:text-6xl lg:text-7xl">
              Architecture competitions, only the beginning.
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-gray-900 sm:text-xl">
              Full transparency, every step — open prize pools, honest terms, for designers and organizers alike.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/competitions" size="lg" variant="primary">
                Browse Competitions
              </Button>
              <Button href="/create" size="lg" variant="ghost" className="border-2 border-gray-950 text-gray-950 hover:bg-black/10">
                Create a Competition ↗︎
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Last Call */}
      {lastCall.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-widest text-red-600">
              <span className="h-1.5 w-1.5 animate-pulse bg-red-500" />
              Last Call
            </span>
            <span className="font-mono text-[0.625rem] uppercase tracking-widest text-gray-400">Closing soon</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lastCall.map((c) => (
              <CompetitionCard key={c.id} competition={c} compact />
            ))}
          </div>
        </section>
      )}

      {/* Featured Competitions */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">Featured</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-[#111]">
              Open Competitions
            </h2>
          </div>
          <Link
            href="/competitions"
            className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400 hover:text-[#111] transition-colors sm:block"
          >
            View all →
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
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">How it works</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-[#111]">
            Aligned incentives, all the way down.
          </h2>
          <p className="mt-3 max-w-xl text-gray-500">
            We take 5% at payout only — we don&apos;t succeed unless competitions do.
          </p>

          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {/* For Designers */}
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">01 — Designers</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>Always free to submit</li>
                <li>You own your work — strong IP protections</li>
                <li>Verified prize pools — see the money before you start</li>
                <li>Anonymous judging enforced by the platform</li>
              </ul>
            </div>

            {/* For Organizers */}
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">02 — Organizers</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>Free to create — fund the prize, not a listing fee</li>
                <li>Quality templates make great briefs easy</li>
                <li>Open prize pools attract more funding</li>
                <li>Build reputation with verified, on-chain payouts</li>
              </ul>
            </div>

            {/* For Contributors */}
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">03 — Contributors</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>Fund competitions you believe in</li>
                <li>Bigger pools attract better ideas</li>
                <li>See real-world impact of your contribution</li>
                <li>Transparent — every dollar is tracked</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-[#111] sm:text-4xl">
            Ready to rethink<br />architecture competitions?
          </h2>
          <p className="mt-4 max-w-lg text-gray-500">
            Whether you&apos;re submitting designs, creating competitions, or funding ideas
            that matter — built for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/competitions" size="lg">Browse Competitions</Button>
            <Button href="/create" size="lg" variant="outline">Create a Competition</Button>
          </div>
        </div>
      </section>
    </>
  );
}
