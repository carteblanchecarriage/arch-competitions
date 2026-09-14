import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Counterparti",
  description: "The terms that govern your use of Counterparti, including how prize pools work and who bears the risk.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-gray-400">Effective September 14, 2026</p>
      <div className="mt-6 border-t border-gray-200" />

      <div className="prose mt-8">
        <p>
          Welcome to Counterparti. These Terms of Service (&quot;Terms&quot;) govern your access to and use
          of the Counterparti website, application, and related services (the &quot;Platform&quot;),
          operated by Counterparti LLC (&quot;Counterparti,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an
          account, browsing competitions, submitting an entry, registering, or funding a prize
          pool, you agree to these Terms. If you don&apos;t agree, please don&apos;t use the Platform.
        </p>

        <h3>1. What Counterparti Is</h3>
        <p>
          Counterparti is a technology platform that connects architecture competition
          organizers, designers, and prize pool contributors. We provide the tools to publish
          competitions, manage registration, submissions, and jury review, and hold prize funds
          in escrow until a competition resolves.
        </p>
        <p>
          We are not an architecture firm, a competition organizer, a judge, a bank, a money
          transmitter, an investment adviser, or a fiduciary. Organizers are independent third
          parties, responsible for their own competition&apos;s brief, judging, prize decisions, and
          compliance with any professional or regulatory standards that apply to them.
          Counterparti is not a party to any competition, submission, or prize award, and we
          don&apos;t guarantee the outcome, quality, or legitimacy of any competition listed on the
          Platform.
        </p>

        <h3>2. Accounts</h3>
        <p>
          You need an account to create a competition, register for one, submit an entry, or
          fund a prize pool. You&apos;re responsible for the accuracy of the information you provide
          and for activity that happens under your account. Accounts can be created with just an
          email address — a digital wallet is generated automatically in the background to hold
          and move funds on your behalf, so you never need to manage seed phrases or gas fees
          directly. You&apos;re still the account holder responsible for actions taken through that
          wallet. If you prefer, you can connect your own external wallet instead.
        </p>

        <h3>3. Eligibility &amp; Sanctions Compliance</h3>
        <p>
          You must be at least 18 years old, or the age of majority in your jurisdiction, to
          create an account. By using the Platform, you represent that you&apos;re not located in,
          organized under the laws of, or a resident of any country or region subject to
          comprehensive U.S. or other applicable trade sanctions or embargoes, and that you don&apos;t
          appear on any government list of prohibited or restricted parties, including the U.S.
          Treasury&apos;s Specially Designated Nationals list. We may restrict or refuse service to
          anyone we reasonably believe doesn&apos;t meet these requirements.
        </p>
        <p>
          We screen wallet addresses used to fund a prize pool against the U.S. Treasury&apos;s
          published list of sanctioned digital currency addresses, and will block a transaction
          that matches. This screening has real limits — it can only catch addresses that list
          has explicitly published — and isn&apos;t a substitute for your own representation above.
        </p>

        <h3>4. How Competitions Work</h3>
        <p>
          Organizers create competitions, set a prize pool, and define entry and judging rules.
          Designers register and submit entries for free — Counterparti never charges submission
          fees. Anyone can contribute to an open prize pool where the organizer has enabled that
          option. Full mechanics — deadlines, cancellation terms, distribution rules — are shown
          on each competition page and summarized in our{" "}
          <Link href="/faq">FAQ</Link>, and are incorporated into these Terms for the competitions
          you take part in.
        </p>

        <h3 id="risk">5. Prize Pools, Funding &amp; Risk</h3>
        <p>This is the part we want to be extra clear about.</p>
        <p>
          Prize pools on Counterparti are held in a smart contract escrow on the Base network,
          denominated in USDC. Once a prize pool is funded — by an organizer, or by anyone
          contributing to an open pool — those funds are locked in the escrow contract. Counterparti
          does not hold, custody, or control them, and we can&apos;t move, refund, or reverse a
          contribution once it&apos;s made, except through the release conditions built into the
          contract itself: a winner is selected, a competition is cancelled under its stated
          terms, or an unresolved competition passes its 30-day distribution deadline.
        </p>
        <p>
          <strong>Funding a prize pool, or relying on one, is done at your own risk.</strong> By
          funding a prize pool or taking part in a competition, you acknowledge that:
        </p>
        <ul>
          <li>
            Counterparti doesn&apos;t guarantee a competition will run as described, that an organizer
            will select a winner, or that any particular outcome will occur.
          </li>
          <li>
            Counterparti isn&apos;t responsible for an organizer&apos;s conduct, a competition&apos;s brief, or
            any dispute between an organizer, a designer, and a contributor.
          </li>
          <li>
            Smart contracts and digital assets carry inherent technical risk. Despite testing, a
            contract could contain a flaw, and the underlying blockchain network can experience
            outages or disruptions outside our control. USDC is issued by a third party (Circle);
            Counterparti doesn&apos;t control its issuance, reserves, or redemption.
          </li>
          <li>
            Funds held in escrow are not bank deposits and are not insured by the FDIC, SIPC, or
            any similar program.
          </li>
          <li>
            Counterparti retains a limited, platform-only emergency function on our escrow
            contracts that can move funds to safety if a critical contract-level issue is
            discovered. It exists solely to protect users from technical failure, not to give us
            discretionary access to competition funds, and any use of it is publicly visible
            on-chain.
          </li>
          <li>
            We take a 5% fee on prize distributions, cancellations, and lapsed-deadline payouts,
            disclosed on the competition page before you fund or register.
          </li>
        </ul>
        <p>
          None of this is investment advice, and a prize pool contribution is not an investment.
          Nothing on the Platform should be read as a promise of financial return, and past
          competitions are not a guarantee of how future ones will play out.
        </p>

        <h3>6. Fees</h3>
        <p>
          Creating a competition and submitting an entry are always free. Counterparti takes a
          flat 5% fee from prize distributions — winner payouts, cancellation splits, and
          automatic lapsed-deadline distributions. There are no listing fees, entry fees, or
          subscription charges.
        </p>

        <h3>7. Tax Responsibility</h3>
        <p>
          Organizers are solely responsible for any tax reporting or withholding obligations tied
          to the prizes they pay out, including issuing any tax forms required by law to prize
          winners. Designers and contributors are responsible for reporting and paying any taxes
          owed on prizes they receive or on their use of digital assets through the Platform.
          Counterparti doesn&apos;t provide tax advice, doesn&apos;t act as a withholding agent, and doesn&apos;t
          file tax forms on behalf of organizers or designers.
        </p>

        <h3>8. Intellectual Property</h3>
        <p>
          By default, designers retain full ownership of everything they submit. Some
          competitions request a limited license or, in rarer cases, a transfer of rights to the
          winning entry — those terms are always shown on the competition page before you
          register, and anything beyond standard practice carries a visible warning. Counterparti
          claims no ownership over submitted work; we only use it to operate and display the
          Platform.
        </p>

        <h3>9. Copyright Complaints (DMCA)</h3>
        <p>
          If you believe content on the Platform infringes your copyright, send a notice to{" "}
          <a href="mailto:legal@counterparti.com">legal@counterparti.com</a> including: (1) a
          description of the copyrighted work you claim is infringed; (2) the location of the
          allegedly infringing material on the Platform; (3) your contact information; (4) a
          statement that you have a good-faith belief the use isn&apos;t authorized by the copyright
          owner, its agent, or the law; (5) a statement, made under penalty of perjury, that the
          notice is accurate and that you&apos;re authorized to act on the copyright owner&apos;s behalf;
          and (6) your physical or electronic signature. We&apos;ll respond in accordance with the
          Digital Millennium Copyright Act, which may include removing or disabling access to the
          material and notifying the person who posted it. Accounts belonging to repeat
          infringers may be terminated.
        </p>

        <h3>10. Organizer Responsibilities</h3>
        <p>
          Organizers agree to run their competitions as described to designers at the time of
          registration, including deadlines, prize splits, and IP terms. If a winning design is
          later commissioned for construction, the organizer agrees to pay the winning architect
          standard professional fees, separate from and in addition to the competition prize —
          this reflects the UIA Accord on Competitions and is acknowledged by every organizer
          before publishing. Organizers are solely responsible for the legality, accuracy, and
          fairness of their competition brief and judging process.
        </p>

        <h3>11. Prohibited Conduct</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Misrepresent yourself, a competition, or your rights to submitted work.</li>
          <li>Use the Platform to launder funds or move money for any purpose unrelated to a genuine competition.</li>
          <li>Interfere with, reverse-engineer, or attempt to disrupt the Platform or its smart contracts.</li>
          <li>Submit work you don&apos;t have the rights to, or infringe on anyone else&apos;s intellectual property.</li>
          <li>
            Post or submit content that is illegal, sexually explicit, pornographic, or otherwise
            not appropriate for a professional design venue.
          </li>
          <li>Use the Platform for any unlawful purpose.</li>
        </ul>

        <h3>12. Content Standards &amp; Removal</h3>
        <p>
          Counterparti is meant to be a professional venue for architecture and design work. We
          may, in our sole discretion and without prior notice, remove or hide any competition,
          submission, profile, or other content from public view — and suspend or terminate the
          account responsible for it — if we reasonably believe it violates Section 11, applicable
          law, or is otherwise inappropriate for the Platform. We aren&apos;t obligated to provide an
          explanation or a chance to appeal before acting, though we&apos;ll try to notify the
          affected user when practical.
        </p>
        <p>
          Removing or hiding a competition is a listing and content-hosting decision — it doesn&apos;t,
          by itself, move, freeze, or release funds already locked in that competition&apos;s on-chain
          escrow. Those funds keep following the standard release conditions in Section 5 (a
          winner is selected, the organizer cancels under the competition&apos;s normal terms, or the
          deadline lapses and funds distribute to registered designers). Removal for a Terms
          violation may also mean we decline to feature, promote, or otherwise support that
          competition going forward, and repeat or serious violations — including illegal content —
          can result in permanent account termination.
        </p>

        <h3>13. Disclaimers</h3>
        <p>
          <strong>
            The Platform is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind,
            whether express, implied, or statutory, including implied warranties of
            merchantability, fitness for a particular purpose, and non-infringement. We don&apos;t
            warrant that the Platform will be uninterrupted, error-free, or secure, or that any
            competition, submission, or prize pool will meet your expectations.
          </strong>
        </p>

        <h3>14. Limitation of Liability</h3>
        <p>
          To the fullest extent permitted by law, Counterparti and its officers, employees, and
          affiliates won&apos;t be liable for any indirect, incidental, special, consequential, or
          punitive damages, or for any loss of funds, profits, data, or goodwill, arising from
          your use of the Platform — including losses related to a competition&apos;s outcome, an
          organizer&apos;s conduct, or the performance of the underlying blockchain network or smart
          contracts. Where liability can&apos;t be excluded, our total liability to you for any claim
          is limited to the greater of $100 or the platform fees you paid us in the twelve months
          before the claim arose.
        </p>

        <h3>15. Indemnification</h3>
        <p>
          You agree to indemnify and hold Counterparti harmless from any claim, loss, or expense
          (including reasonable legal fees) arising from your use of the Platform, your
          submissions, your conduct as an organizer, or your violation of these Terms.
        </p>

        <h3>16. Governing Law</h3>
        <p>
          These Terms are governed by the laws of the State of Delaware, without regard to
          conflict-of-law principles. Any dispute not resolved informally will be brought in the
          state or federal courts located in Delaware, and you consent to that jurisdiction.
        </p>

        <h3>17. Force Majeure</h3>
        <p>
          We won&apos;t be liable for any failure or delay in operating the Platform caused by events
          outside our reasonable control, including outages or congestion on the Base network or
          other blockchain infrastructure, failures of a third-party provider we rely on (Privy,
          Supabase, Circle, our hosting provider), internet or utility disruptions, natural
          disasters, or changes in law.
        </p>

        <h3>18. General Provisions</h3>
        <p>
          If any part of these Terms is found unenforceable, the rest remains in full effect. Our
          failure to enforce a provision isn&apos;t a waiver of it. You can&apos;t assign your rights or
          obligations under these Terms without our consent; we may assign ours in connection with
          a merger, acquisition, or sale of assets. These Terms, together with the{" "}
          <Link href="/privacy">Privacy Policy</Link> and the terms shown on each competition page,
          are the entire agreement between you and Counterparti regarding the Platform.
        </p>

        <h3>19. Termination</h3>
        <p>
          We may suspend or terminate your access to the Platform if you violate these Terms.
          Funds already locked in an on-chain escrow contract are governed by that contract&apos;s
          release conditions regardless of account status — termination of your account doesn&apos;t
          change how or when escrowed funds are released.
        </p>

        <h3>20. Changes to These Terms</h3>
        <p>
          We may update these Terms from time to time. If we make material changes, we&apos;ll post
          the updated version here with a new effective date. Continued use of the Platform after
          a change means you accept the updated Terms.
        </p>

        <h3>21. Contact</h3>
        <p>
          Questions about these Terms? Reach us at{" "}
          <a href="mailto:legal@counterparti.com">legal@counterparti.com</a>.
        </p>
      </div>
    </div>
  );
}
