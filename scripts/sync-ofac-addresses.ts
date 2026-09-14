/**
 * Regenerate src/data/sanctioned-addresses.json from OFAC's published SDN
 * cryptocurrency address list — used to screen wallets before funding a
 * prize pool. See src/lib/sanctions.ts.
 *
 * This is a static, git-committed file, not a live database sync — the list
 * is small (~150 EVM addresses) and OFAC doesn't update it in real time, so
 * "run this occasionally and commit the diff" is simpler and more
 * transparent (you can see exactly what changed in the PR) than a live
 * table. Only EVM-format (0x...) addresses are kept — Bitcoin/Tron/Solana/etc.
 * addresses in the source list can never match a Base wallet.
 *
 * Usage:
 *   npm run sync:ofac
 *   git diff src/data/sanctioned-addresses.json   # review what changed
 *   git commit
 *
 * Run this before launch, then re-run + commit periodically (monthly is
 * reasonable; OFAC updates the SDN list on an unpredictable cadence). There's
 * no automation wired up for this — it's a deliberate one-person, one-command,
 * review-the-diff step, not a background job.
 *
 * IMPORTANT LIMITATION: only catches addresses OFAC has explicitly published.
 * No address-clustering or indirect-exposure analysis. For real coverage at
 * volume, use a paid screening service (Chainalysis, TRM Labs, Elliptic).
 */
import { writeFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";

const SOURCE_URL = "https://www.treasury.gov/ofac/downloads/sdn.xml";
const OUT_PATH = "src/data/sanctioned-addresses.json";

interface SdnId {
  idType?: string;
  idNumber?: string;
}

interface SdnEntry {
  uid: string | number;
  idList?: { id?: SdnId | SdnId[] };
}

async function main() {
  console.log(`Fetching ${SOURCE_URL} …`);
  const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`OFAC fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  console.log(`Fetched ${(xml.length / 1024 / 1024).toFixed(1)} MB.`);

  // parseTagValue: false is load-bearing. fast-xml-parser otherwise coerces
  // numeric-looking tag text into JS numbers — a 42-char hex address like
  // "0x252a8b...ce" silently becomes "2.12e+47" (lossy scientific notation),
  // with no error thrown. That would make every EVM address permanently
  // unmatchable while this script reports success. Verified against a live
  // fetch before shipping this.
  const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false });
  const doc = parser.parse(xml);

  const entries: SdnEntry[] = doc?.sdnList?.sdnEntry;
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("Parsed 0 sdnEntry elements — OFAC's XML structure may have changed.");
  }
  console.log(`Parsed ${entries.length} SDN entries.`);

  const addresses = new Set<string>();
  let digitalCurrencyCount = 0;

  for (const entry of entries) {
    const ids = entry.idList?.id;
    if (!ids) continue;
    const idArray = Array.isArray(ids) ? ids : [ids];

    for (const id of idArray) {
      if (!id.idType?.startsWith("Digital Currency Address")) continue;
      digitalCurrencyCount++;
      const address = String(id.idNumber ?? "").trim().toLowerCase();
      if (/^0x[0-9a-f]{40}$/.test(address)) addresses.add(address);
    }
  }

  if (digitalCurrencyCount === 0) {
    throw new Error("Found 0 Digital Currency Address ids — OFAC's tagging may have changed.");
  }
  if (addresses.size === 0) {
    throw new Error(
      `Found ${digitalCurrencyCount} digital currency addresses but 0 matched the EVM (0x...) format — parsing may be broken. Refusing to write an empty list.`
    );
  }

  const sorted = [...addresses].sort();
  writeFileSync(OUT_PATH, JSON.stringify(sorted, null, 2) + "\n");
  console.log(
    `Wrote ${sorted.length} EVM addresses to ${OUT_PATH} (out of ${digitalCurrencyCount} digital currency addresses across all chains).`
  );
  console.log("Review with `git diff` and commit.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
