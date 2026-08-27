import { Resend } from "resend";

let _client: Resend | null = null;

export function getResend(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY must be set");
    _client = new Resend(apiKey);
  }
  return _client;
}

/** "Display Name <address@domain>" — set once your sending domain is verified in Resend. */
export function getEmailFrom(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL must be set");
  return from;
}
