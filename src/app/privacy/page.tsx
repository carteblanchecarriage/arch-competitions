import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Counterparti",
  description: "What information Counterparti collects, why, and how it's handled.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-gray-400">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-gray-400">Effective September 14, 2026</p>
      <div className="mt-6 border-t border-gray-200" />

      <div className="prose mt-8">
        <p>
          This Privacy Policy explains what information Counterparti LLC (&quot;Counterparti,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects when you use our website and application (the
          &quot;Platform&quot;), why we collect it, and the choices you have. By using the Platform, you
          agree to the practices described here.
        </p>

        <h3>1. Information We Collect</h3>
        <p>
          <strong>Account information.</strong> When you sign in, we (through our authentication
          provider) collect your email address and create a digital wallet address associated
          with your account. If you connect your own wallet instead, we collect that wallet
          address.
        </p>
        <p>
          <strong>Profile and competition information.</strong> Anything you choose to add to
          your profile, and anything you submit as part of creating a competition, registering,
          submitting an entry, or asking a question — names, bios, briefs, images, uploaded
          files, and messages.
        </p>
        <p>
          <strong>Transaction information.</strong> When you fund or contribute to a prize pool,
          the amount and the associated wallet address are recorded — both by us, to show
          verified pool balances, and permanently on the Base blockchain, which is public by
          design (see Section 4).
        </p>
        <p>
          <strong>Usage information.</strong> Standard technical data like IP address, browser
          type, device information, and pages visited, collected automatically through our
          hosting and analytics providers.
        </p>

        <h3>2. How We Use Information</h3>
        <ul>
          <li>To operate the Platform — accounts, competitions, submissions, and prize pools.</li>
          <li>To verify prize pool balances and show payout history transparently.</li>
          <li>To send transactional emails — deadline reminders, jury answers, funding confirmations.</li>
          <li>To detect and prevent fraud, abuse, or violations of our <Link href="/terms">Terms of Service</Link>.</li>
          <li>To understand how the Platform is used, so we can improve it.</li>
        </ul>
        <p>We don&apos;t sell your personal information.</p>

        <h3>3. Third-Party Service Providers</h3>
        <p>We rely on a small number of providers to operate the Platform:</p>
        <ul>
          <li><strong>Privy</strong> — authentication and embedded wallet infrastructure.</li>
          <li><strong>Supabase</strong> — our database and file storage.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Vercel</strong> — hosting and privacy-respecting analytics.</li>
          <li><strong>Circle (USDC)</strong> and the <strong>Base network</strong> — the digital dollar and blockchain infrastructure that prize pools run on.</li>
        </ul>
        <p>
          Each provider processes data only as needed to provide their service to us, under their
          own privacy and security practices.
        </p>

        <h3>4. Public Blockchain Data</h3>
        <p>
          Prize pool contributions, funding, and payouts happen through smart contracts on the
          Base network. Like any public blockchain, transaction data — wallet addresses, amounts,
          and timestamps — is permanently recorded and publicly visible, including to anyone
          browsing the contract on a block explorer. This is what makes prize pools verifiable,
          but it also means this data cannot be deleted or made private once recorded, even if
          you delete your Counterparti account.
        </p>

        <h3>5. Cookies &amp; Analytics</h3>
        <p>
          We use minimal, privacy-respecting analytics to understand aggregate usage of the
          Platform. We don&apos;t use third-party advertising trackers.
        </p>

        <h3>6. Data Sharing</h3>
        <p>
          We share information with the service providers listed above, as needed to operate the
          Platform, and with organizers or jurors where necessary for a competition you&apos;ve
          registered for (for example, so an organizer can see who registered). We may also
          disclose information if required by law, or to protect the rights, safety, or property
          of Counterparti or our users.
        </p>

        <h3>7. Data Retention</h3>
        <p>
          We retain account and competition data for as long as your account is active, and for a
          reasonable period after in case it&apos;s needed for legal, security, or record-keeping
          purposes. Blockchain transaction data is retained indefinitely by the nature of the
          network, independent of your Counterparti account.
        </p>

        <h3>8. Your Choices</h3>
        <p>
          You can review and update your profile information at any time from your account
          settings. You can request deletion of your account and associated off-chain data by
          contacting us — note that this doesn&apos;t affect data already recorded on the blockchain,
          which we don&apos;t control.
        </p>

        <h3>9. California Privacy Rights</h3>
        <p>
          If you&apos;re a California resident, the California Consumer Privacy Act (as amended by
          the CPRA) gives you the right to know what personal information we&apos;ve collected about
          you, request its deletion, correct inaccurate information, and opt out of the sale or
          sharing of personal information — we don&apos;t sell or share personal information as those
          terms are defined by the CCPA. To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@counterparti.com">privacy@counterparti.com</a>. We won&apos;t
          discriminate against you for exercising them.
        </p>

        <h3>10. European Privacy Rights</h3>
        <p>
          If you&apos;re located in the European Economic Area, United Kingdom, or Switzerland, you
          have rights under the General Data Protection Regulation, including the right to
          access, correct, delete, or port your personal data, and to object to or restrict
          certain processing. We process your information based on our legitimate interest in
          operating the Platform, the performance of our contract with you under these Terms, and,
          where required, your consent. To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@counterparti.com">privacy@counterparti.com</a>.
        </p>

        <h3>11. Children&apos;s Privacy</h3>
        <p>
          The Platform isn&apos;t directed at children under 16, and we don&apos;t knowingly collect
          information from them.
        </p>

        <h3>12. Security</h3>
        <p>
          We use reasonable technical and organizational measures to protect your information,
          but no method of transmission or storage is completely secure, and we can&apos;t guarantee
          absolute security.
        </p>

        <h3>13. Changes to This Policy</h3>
        <p>
          We may update this policy from time to time. Material changes will be posted here with
          a new effective date.
        </p>

        <h3>14. Contact</h3>
        <p>
          Questions about this policy, or want to exercise a data right? Reach us at{" "}
          <a href="mailto:privacy@counterparti.com">privacy@counterparti.com</a>.
        </p>
      </div>
    </div>
  );
}
