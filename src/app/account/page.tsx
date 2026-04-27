"use client";

import { useEffect, useState, useTransition } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { getProfile, saveProfile, type ProfileInput } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";

const SPECIALTY_OPTIONS = [
  "Residential", "Commercial", "Urban Design", "Landscape",
  "Interior", "Sustainable", "Heritage", "Public Space",
  "Education", "Healthcare", "Hospitality", "Industrial",
];

type ProfileState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "ready"; data: ProfileData | null }
  | { status: "error"; message: string };

interface ProfileData {
  slug: string;
  name: string;
  type: "individual" | "studio";
  country: string;
  city: string;
  bio: string;
  specialties: string[];
  website: string;
  yearEstablished: string;
}

function blankForm(): ProfileData {
  return {
    slug: "",
    name: "",
    type: "individual",
    country: "",
    city: "",
    bio: "",
    specialties: [],
    website: "",
    yearEstablished: "",
  };
}

export default function AccountPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [profileState, setProfileState] = useState<ProfileState>({ status: "loading" });
  const [form, setForm] = useState<ProfileData>(blankForm());
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load profile once authenticated
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      setProfileState({ status: "unauthenticated" });
      return;
    }

    getAccessToken().then(async (token) => {
      if (!token) {
        setProfileState({ status: "unauthenticated" });
        return;
      }
      try {
        const row = await getProfile(token);
        if (row) {
          setForm({
            slug: row.slug,
            name: row.name,
            type: row.type,
            country: row.country,
            city: row.city ?? "",
            bio: row.bio,
            specialties: row.specialties,
            website: row.website ?? "",
            yearEstablished: row.year_established ? String(row.year_established) : "",
          });
        }
        setProfileState({ status: "ready", data: row ? form : null });
      } catch (e) {
        setProfileState({ status: "error", message: String(e) });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      const token = await getAccessToken();
      if (!token) return;

      const input: ProfileInput = {
        name: form.name,
        type: form.type,
        country: form.country,
        city: form.city || undefined,
        bio: form.bio,
        specialties: form.specialties,
        website: form.website || undefined,
        yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : undefined,
      };

      try {
        const { slug } = await saveProfile(token, input);
        setForm((f) => ({ ...f, slug }));
        setProfileState({ status: "ready", data: form });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        setProfileState({ status: "error", message: String(e) });
      }
    });
  }

  // ── render states ──────────────────────────────────────────────────────────

  if (profileState.status === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </main>
    );
  }

  if (profileState.status === "unauthenticated") {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-3 text-gray-500">
          Sign in to create or manage your designer profile.
        </p>
        <Button onClick={login} className="mt-6">
          Sign in
        </Button>
      </main>
    );
  }

  if (profileState.status === "error") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {profileState.message}
        </div>
      </main>
    );
  }

  const isNew = !form.slug;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Create your profile" : "Your profile"}
          </h1>
          {!isNew && (
            <Link
              href={`/submitters/${form.slug}`}
              className="mt-1 text-sm text-gray-500 hover:text-gray-900 underline decoration-gray-300"
            >
              View public profile
            </Link>
          )}
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved
          </span>
        )}
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Smith"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <div className="mt-1 flex gap-3">
            {(["individual", "studio"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  form.type === t
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="United States"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="New York"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={4}
            placeholder="Brief professional background…"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none resize-none"
          />
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Specialties</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  form.specialties.includes(s)
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            placeholder="https://yourwebsite.com"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Year established (studios) */}
        {form.type === "studio" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Year Established
            </label>
            <input
              type="number"
              value={form.yearEstablished}
              onChange={(e) => setForm((f) => ({ ...f, yearEstablished: e.target.value }))}
              placeholder="2010"
              min="1900"
              max={new Date().getFullYear()}
              className="mt-1 w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        )}

        {/* Save */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            Your profile is public once saved.
          </p>
          <Button
            onClick={handleSave}
            disabled={isPending || !form.name || !form.country}
          >
            {isPending ? "Saving…" : isNew ? "Create profile" : "Save changes"}
          </Button>
        </div>
      </div>
    </main>
  );
}
