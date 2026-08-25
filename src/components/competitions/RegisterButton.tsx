"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { registerForCompetition, getMyRegistration } from "@/app/actions/registration";

export function RegisterButton({
  competitionId,
  initialCount,
}: {
  competitionId: string;
  initialCount: number;
}) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [isRegistered, setIsRegistered] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) { setChecking(false); return; }
    getAccessToken().then(async (token) => {
      if (!token) { setChecking(false); return; }
      try {
        const registered = await getMyRegistration(token, competitionId);
        setIsRegistered(registered);
      } finally {
        setChecking(false);
      }
    });
  }, [ready, authenticated, competitionId]);

  async function handleRegister() {
    if (!authenticated) { login(); return; }
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) { login(); return; }
      await registerForCompetition(token, competitionId);
      setIsRegistered(true);
      setCount((c) => c + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || checking) {
    return <div className="h-10 w-full animate-pulse  bg-gray-100" />;
  }

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2  bg-emerald-50 px-4 py-2.5">
        <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <div>
          <span className="text-sm font-medium text-emerald-800">You&apos;re registered</span>
          {count > 0 && (
            <span className="ml-1.5 text-xs text-emerald-600">
              Â· {count} {count === 1 ? "designer" : "designers"} registered
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Button
        className="w-full"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Registering…" : "I'd like to work on this"}
      </Button>
      {count > 0 && (
        <p className="text-center text-xs text-gray-400">
          {count} {count === 1 ? "designer" : "designers"} registered
        </p>
      )}
      {error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
