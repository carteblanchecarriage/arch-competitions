import { PrivyClient } from "@privy-io/server-auth";

let _client: PrivyClient | null = null;

export function getPrivyServer(): PrivyClient {
  if (!_client) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const secret = process.env.PRIVY_APP_SECRET;
    if (!appId || !secret) {
      throw new Error("NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET must be set");
    }
    _client = new PrivyClient(appId, secret);
  }
  return _client;
}
