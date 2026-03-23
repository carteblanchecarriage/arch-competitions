import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Competitions should work for designers.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          The architecture competition industry is broken. Designers pay to enter, prize payouts
          are unverifiable, and the value flows the wrong way. We&apos;re fixing that.
        </p>
      </div>

      {/* The Problem */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">The Problem</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            {
              title: "Designers pay to submit",
              description:
                "Entry fees of $40-100+ are standard. Multiply by hundreds of entries and organizers often collect more in fees than they pay in prizes.",
            },
            {
              title: "Prizes are unverifiable",
              description:
                "Did the winner get paid? When? The full amount? There's no public proof. Organizers self-report and the community has to trust them.",
            },
            {
              title: "Quality is inconsistent",
              description:
                "Anyone can call something a 'competition.' There's no framework ensuring clear briefs, fair judging, or professional standards.",
            },
            {
              title: "IP rights are buried",
              description:
                "Many competitions quietly claim broad rights over all submissions. Designers hand over months of work without realizing they've signed away their rights.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Principles */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">Our Principles</h2>
        <div className="mt-6 space-y-6">
          {[
            {
              title: "Free to submit, always",
              description:
                "No entry fees, ever. If a competition is on our platform, it's free to enter. Period.",
            },
            {
              title: "Free to create",
              description:
                "No listing fees. The only requirement is funding a prize pool (minimum $100). Real money escrowed = real competition.",
            },
            {
              title: "Transparent prize pools",
              description:
                "Every competition shows its prize pool in real time — total amount, breakdown by place, funding status, and payout verification.",
            },
            {
              title: "Designers own their work",
              description:
                "The default IP terms protect designers. No blanket rights grabs. Aggressive terms get visible warnings so designers can make informed decisions.",
            },
            {
              title: "5% at payout — aligned incentives",
              description:
                "We take a transparent 5% when prizes are paid out. If a competition is cancelled, no fee is taken. We only succeed when competitions succeed.",
            },
            {
              title: "Competitions are beginnings",
              description:
                "Every competition has a living timeline. Did it get built? What happened next? We follow the story from brief to built.",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open Prize Pools */}
      <section className="mt-16 rounded-xl bg-gray-950 p-8 text-white sm:p-10">
        <h2 className="text-2xl font-bold">Open Prize Pools</h2>
        <p className="mt-3 text-gray-300">
          Some competitions address challenges that matter to everyone — public housing,
          climate resilience, civic spaces. For these competitions, anyone can contribute to
          the prize fund.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-4">
            <div className="text-2xl font-bold">$5k</div>
            <div className="text-sm text-gray-400">Organizer seeds the pool</div>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <div className="text-2xl font-bold">$50k</div>
            <div className="text-sm text-gray-400">Community grows it</div>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <div className="text-2xl font-bold">$200k</div>
            <div className="text-sm text-gray-400">Better ideas for everyone</div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Bigger pools attract more and better submissions. Contributors see the real-world
          impact of their funding. It&apos;s a virtuous cycle.
        </p>
      </section>

      {/* The Fee Math */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">The Transparency Promise</h2>
        <p className="mt-2 text-gray-500">
          Every competition page shows exactly where the money goes.
        </p>
        <div className="mt-6 rounded-lg border border-gray-200 p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Prize pool (funded by organizer + contributors)</span>
              <span className="font-semibold text-gray-900">$10,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform fee (5%, taken at payout only)</span>
              <span className="text-gray-500">-$500</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Net to winners</span>
                <span className="text-gray-900">$9,500</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
              <span>Entry fee for designers</span>
              <span className="font-semibold text-emerald-600">$0 — always free</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Ready to get started?
        </h2>
        <div className="mt-6 flex justify-center gap-4">
          <Button href="/competitions" size="lg">Browse Competitions</Button>
          <Button href="/create" size="lg" variant="outline">Create a Competition</Button>
        </div>
      </section>
    </div>
  );
}
