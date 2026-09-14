import sanctionedAddresses from "@/data/sanctioned-addresses.json";

const SANCTIONED_SET = new Set<string>(sanctionedAddresses);

/**
 * Checks a wallet address against OFAC's published digital-currency-address
 * list (src/data/sanctioned-addresses.json, regenerated via
 * `npm run sync:ofac`). Only catches addresses OFAC has explicitly
 * published — not a substitute for real transaction monitoring at volume
 * (Chainalysis/TRM/Elliptic).
 */
export function isAddressSanctioned(address: string): boolean {
  if (!address) return false;
  return SANCTIONED_SET.has(address.toLowerCase());
}
