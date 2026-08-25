import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const SECTIONS: { title: string; items: FAQItem[] }[] = [
  {
    title: "For Designers",
    items: [
      {
        question: "Is it really free to submit?",
        answer:
          "Yes, always. No entry fees, no submission fees, no catches. Every competition listed on Counterparti is free to enter.",
      },
      {
        question: "Who owns my work?",
        answer:
          "You do. By default, designers retain all rights to their submissions. Some competitions request limited licensing or rights to the winning entry — those terms are shown clearly on every competition page, and anything that goes beyond standard practice gets a visible warning before you enter.",
      },
      {
        question: "How do I know the prize money is real?",
        answer:
          "Before a competition goes live, the organizer funds the prize pool into a verified escrow. You can see the contract address, the balance, and the on-chain transaction history on every competition page. The money is there before you submit anything.",
      },
      {
        question: "What if the organizer never picks a winner?",
        answer:
          "After a competition closes, organizers have 30 days to announce a winner. If that window passes with no decision, the full prize pool can be distributed equally to all registered designers — no action needed from the organizer. Anyone can trigger this distribution.",
      },
      {
        question: "What is registration, and why should I register?",
        answer:
          "Registering for a competition signals your intent to work on it. Registered designers can ask the organizer clarifying questions. You're also protected if anything goes wrong — if the competition is cancelled or abandoned, the prize pool is distributed among registered designers.",
      },
      {
        question: "Can I ask the organizer questions about the brief?",
        answer:
          "Yes, but only after you register. Answers are posted publicly so the whole community benefits. Registration takes one click.",
      },
      {
        question: "What happens if a competition is cancelled?",
        answer:
          "If an organizer cancels a fixed-pool competition, 50% of the prize pool (less the platform fee) is distributed to registered designers, and 50% is returned to the organizer. Open pool competitions cannot be cancelled at all — contributors need that guarantee.",
      },
    ],
  },
  {
    title: "For Organizers",
    items: [
      {
        question: "How much does it cost to create a competition?",
        answer:
          "Nothing upfront. Creating a competition is free. The only requirement is funding the prize pool — minimum $100 — before your competition goes live. We take a 5% platform fee on all distributions.",
      },
      {
        question: "What is the 5% fee and when is it taken?",
        answer:
          "We take 5% on every fund distribution — prize payouts, cancellation splits, and lapsed-deadline distributions. The fee is always shown clearly. There are no hidden charges.",
      },
      {
        question: "Can I cancel my competition?",
        answer:
          "Fixed-pool competitions can be cancelled, but it comes at a cost: 50% of the prize pool (less the 5% fee) goes to registered designers. The remaining 50% (less the 5% fee) is returned to you. Open pool competitions cannot be cancelled — contributors are protected from that possibility from the start.",
      },
      {
        question: "Can I get my prize money back if I change my mind before funding?",
        answer:
          "Yes. Before you fund the escrow, you can abandon the draft and nothing is charged. Once funds are deposited, they are locked — the escrow contract prevents withdrawal by design.",
      },
      {
        question: "How do open prize pools work?",
        answer:
          "When you enable an open pool, anyone can contribute to grow the prize fund. Prize splits are fixed percentages, so every tier scales proportionally as the pool grows. Open pools attract broader participation and can grow far beyond your initial seed amount.",
      },
      {
        question: "Who can answer questions from registered designers?",
        answer:
          "You (the organizer) and any listed jurors can answer questions from your dashboard. Answers are public — everyone sees them.",
      },
      {
        question: "How do I select a winner?",
        answer:
          "From your organizer dashboard after the submission deadline. You have 30 days to announce results. If that window passes without action, the funds distribute automatically to registered designers.",
      },
    ],
  },
  {
    title: "Prize Pools & Escrow",
    items: [
      {
        question: "What is escrow and why does it matter?",
        answer:
          "Escrow means the prize money is held by a smart contract — not by us, not by the organizer. Neither party can move it unilaterally. Once funded, the money stays for the competition. Designers can verify the balance themselves before they submit anything.",
      },
      {
        question: "What token are prizes paid in?",
        answer:
          "USDC — a regulated, fully-reserved digital dollar. Prizes are denominated and paid 1:1 in US dollars. You don't need to understand crypto to use Counterparti; the infrastructure is invisible.",
      },
      {
        question: "Can the organizer withdraw the prize pool?",
        answer:
          "No. Once funds are deposited, they cannot be withdrawn by the organizer. The only exits are: a winner is announced, the competition is cancelled (with the 50% penalty), or the 30-day deadline passes and funds distribute to registered designers.",
      },
      {
        question: "What if I contributed to an open pool and the competition is abandoned?",
        answer:
          "Open pool competitions cannot be cancelled by the organizer. If the 30-day judging window passes with no winner selected, funds are distributed to all registered designers. Your contribution is protected.",
      },
      {
        question: "Is there an emergency rescue if something goes wrong with the contract?",
        answer:
          "Yes. Counterparti retains a platform-only emergency function that can move funds to safety if a contract issue is discovered. This is a transparent escape hatch — the function is in the public contract code. We intend to remove this capability as the platform matures and the contracts are battle-tested.",
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        question: "How does Counterparti make money?",
        answer:
          "A flat 5% fee on every distribution — prize payouts, cancellations, and automatic distributions. That's it. No listing fees, no entry fees, no subscription. We only earn when competitions succeed.",
      },
      {
        question: "Do I need a crypto wallet?",
        answer:
          "No. Counterparti handles wallets invisibly. You sign in with email — a wallet is created for you in the background. You'll never see a seed phrase or be asked to approve a transaction in a browser extension.",
      },
      {
        question: "What chain are the contracts on?",
        answer:
          "Base — an Ethereum Layer 2 network. Transactions are fast and fees are low (typically a few cents). You never need to interact with the chain directly.",
      },
      {
        question: "Can I use Counterparti if I'm not a professional architect?",
        answer:
          "It depends on the competition. Open competitions accept anyone; some are restricted to students, licensed practitioners, or invite-only participants. Each competition lists its eligibility requirements clearly.",
      },
    ],
  },
];

export const metadata = {
  title: "FAQ — Counterparti",
  description: "Common questions about how Counterparti competitions work.",
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          How Counterparti works — for designers, organizers, and contributors.
        </p>
      </div>

      <div className="space-y-14">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-400">
              {section.title}
            </h2>
            <div className="space-y-0 divide-y divide-gray-100  border border-gray-200">
              {section.items.map((item, i) => (
                <details key={i} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="text-sm font-semibold text-gray-900 group-open:text-gray-700">
                      {item.question}
                    </span>
                    <span className="mt-0.5 shrink-0 text-gray-400 transition-transform group-open:rotate-45">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16  bg-gray-950 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Still have questions?</h2>
        <p className="mt-2 text-sm text-gray-400">
          Read through our principles, or browse live competitions to see how it works.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button href="/about" variant="ghost" className="border border-gray-600 text-white hover:bg-white/10">
            Our Principles
          </Button>
          <Button href="/competitions" variant="secondary">
            Browse Competitions
          </Button>
        </div>
      </div>
    </div>
  );
}
