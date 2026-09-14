"use server";

import { isAddressSanctioned } from "@/lib/sanctions";

/** No auth required — this is a simple address lookup, not sensitive. */
export async function checkAddressSanctioned(address: string): Promise<boolean> {
  return isAddressSanctioned(address);
}
