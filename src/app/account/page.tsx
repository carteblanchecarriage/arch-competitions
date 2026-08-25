"use client";

import { useEffect, useRef, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { getProfile, saveProfile, type ProfileInput } from "@/app/actions/profile";
import { getMyDraft, discardDraft, type SavedDraft } from "@/app/actions/draft";
import { Button } from "@/components/ui/Button";
import { WithdrawButton } from "@/components/ui/WithdrawButton";

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
  website: string;
  yearEstablished: string;
  contributors: string[];
}

function blankForm(): ProfileData {
  return {
    slug: "",
    name: "",
    type: "individual",
    country: "",
    city: "",
    bio: "",
    website: "",
    yearEstablished: "",
    contributors: [],
  };
}

function rowToForm(row: NonNullable<Awaited<ReturnType<typeof getProfile>>>): ProfileData {
  return {
    slug: row.slug,
    name: row.name,
    type: row.type,
    country: row.country,
    city: row.city ?? "",
    bio: row.bio,
    website: row.website ?? "",
    yearEstablished: row.year_established ? String(row.year_established) : "",
    contributors: row.type === "studio" ? (row.specialties ?? []) : [],
  };
}

// ── Draft card ─────────────────────────────────────────────────────────────────

function DraftCard({
  draft,
  onDiscard,
  discarding,
}: {
  draft: SavedDraft;
  onDiscard: () => void;
  discarding: boolean;
}) {
  const title = draft.data.title?.trim() || "Untitled draft";
  const updated = new Date(draft.updatedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  return (
    <div className="border border-dashed border-gray-300 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Draft competition
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-0.5 text-xs text-gray-400">Last saved {updated}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={onDiscard}
            disabled={discarding}
            className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
          >
            {discarding ? "Discarding…" : "Discard"}
          </button>
          <Link href="/create">
            <Button size="sm">Continue editing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Inline field helpers ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-gray-400 focus:outline-none";
const textareaClsBase = "w-full resize-none border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-gray-400 focus:outline-none";

// ── Profile page (view + inline edit) ─────────────────────────────────────────

function ProfilePage({
  initialForm,
  isNew,
  draft,
  startEditing,
  onSave,
  onDiscardDraft,
  discardingDraft,
  isPending,
}: {
  initialForm: ProfileData;
  isNew: boolean;
  draft: SavedDraft | null;
  startEditing: boolean;
  onSave: (data: ProfileData, onSuccess: () => void) => void;
  onDiscardDraft: () => void;
  discardingDraft: boolean;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [form, setForm] = useState<ProfileData>(initialForm);
  const [contributorDraft, setContributorDraft] = useState("");

  // Keep form in sync if parent data changes (e.g. after save)
  useEffect(() => { setForm(initialForm); }, [initialForm]);
  useEffect(() => { if (startEditing) setEditing(true); }, [startEditing]);

  function set(patch: Partial<ProfileData>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function addContributor() {
    const name = contributorDraft.trim();
    if (!name) return;
    set({ contributors: [...form.contributors, name] });
    setContributorDraft("");
  }

  function removeContributor(i: number) {
    set({ contributors: form.contributors.filter((_, idx) => idx !== i) });
  }

  function handleCancel() {
    setForm(initialForm);
    setEditing(false);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

      {/* Top nav */}
      {form.slug && !isNew && (
        <Link
          href={`/submitters/${form.slug}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View public profile
        </Link>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          {editing ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Your name"
              className="w-full border-b border-gray-300 bg-transparent pb-1 text-2xl font-bold text-gray-900 focus:border-gray-700 focus:outline-none"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{form.name || "My Profile"}</h1>
          )}

          {/* Type selector — inline toggle in both modes */}
          <div className="mt-2 flex items-center gap-2">
            {editing ? (
              <>
                {(["individual", "studio"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => set({ type: t })}
                    className={`border px-3 py-0.5 text-xs font-medium capitalize transition-colors ${
                      form.type === t
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </>
            ) : (
              <p className="text-sm capitalize text-gray-500">
                {form.type}
                {(form.city || form.country)
                  ? ` · ${[form.city, form.country].filter(Boolean).join(", ")}`
                  : ""}
              </p>
            )}
          </div>
        </div>

        {/* Edit / Save / Cancel buttons */}
        <div className="flex shrink-0 items-center gap-2">
          {editing ? (
            <>
              {!isNew && (
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onSave(form, () => setEditing(false))}
                disabled={isPending || !form.name.trim() || !form.country.trim()}
              >
                {isPending ? "Saving…" : isNew ? "Create profile" : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          )}
        </div>
      </div>

      {/* Drafts — always visible on private profile */}
      {draft && !isNew && (
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">In progress</p>
          <DraftCard draft={draft} onDiscard={onDiscardDraft} discarding={discardingDraft} />
        </div>
      )}

      {/* Balance — only in view mode (not during first-time setup) */}
      {!isNew && !editing && <WithdrawButton />}

      {/* Profile fields */}
      <div className={`mt-6 space-y-5 border border-gray-200 bg-white p-6 ${editing ? "ring-1 ring-gray-900/5" : ""}`}>

        {/* Location */}
        {(editing || form.city || form.country) && (
          <Field label="Location">
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => set({ country: e.target.value })}
                  placeholder="Country *"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder="City"
                  className={inputCls}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-900">
                {[form.city, form.country].filter(Boolean).join(", ")}
              </p>
            )}
          </Field>
        )}

        {/* Bio */}
        {(editing || form.bio) && (
          <Field label="Bio">
            {editing ? (
              <textarea
                value={form.bio}
                onChange={(e) => set({ bio: e.target.value })}
                rows={4}
                placeholder="Brief professional background…"
                className={textareaClsBase}
              />
            ) : (
              <p className="text-sm leading-relaxed text-gray-700">{form.bio}</p>
            )}
          </Field>
        )}

        {/* Website */}
        {(editing || form.website) && (
          <Field label="Website">
            {editing ? (
              <input
                type="url"
                value={form.website}
                onChange={(e) => set({ website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className={inputCls}
              />
            ) : (
              <a
                href={form.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-900 underline decoration-gray-300 hover:decoration-gray-900"
              >
                {form.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </Field>
        )}

        {/* Year established (studios only) */}
        {form.type === "studio" && (editing || form.yearEstablished) && (
          <Field label="Established">
            {editing ? (
              <input
                type="number"
                value={form.yearEstablished}
                onChange={(e) => set({ yearEstablished: e.target.value })}
                placeholder="2010"
                min="1900"
                max={new Date().getFullYear()}
                className={`${inputCls} w-32`}
              />
            ) : (
              <p className="text-sm text-gray-900">{form.yearEstablished}</p>
            )}
          </Field>
        )}

        {/* Contributors (studios only) */}
        {form.type === "studio" && (editing || form.contributors.length > 0) && (
          <Field label="Contributors">
            {form.contributors.length > 0 && (
              <ul className="mb-2 space-y-1">
                {form.contributors.map((name, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-gray-900">
                    <span>{name}</span>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeContributor(i)}
                        className="ml-2 text-gray-300 hover:text-red-400"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={contributorDraft}
                  onChange={(e) => setContributorDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addContributor(); } }}
                  placeholder="Add a name…"
                  className={`flex-1 ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={addContributor}
                  disabled={!contributorDraft.trim()}
                  className="border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}
          </Field>
        )}

        {/* Empty state hint when nothing is filled yet */}
        {!editing && !form.bio && !form.website && !form.city && !form.country &&
          !(form.type === "studio" && (form.yearEstablished || form.contributors.length > 0)) && (
          <p className="text-sm text-gray-400">
            Your profile is empty.{" "}
            <button onClick={() => setEditing(true)} className="underline decoration-gray-300 hover:text-gray-700">
              Add your details
            </button>
          </p>
        )}
      </div>

      {/* Bottom note in edit mode */}
      {editing && (
        <p className="mt-3 text-xs text-gray-400">Your profile is public once saved.</p>
      )}
    </main>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function AccountContent() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const searchParams = useSearchParams();
  const router = useRouter();
  const startInEdit = searchParams.get("edit") === "true";
  const [profileState, setProfileState] = useState<ProfileState>({ status: "loading" });
  const [form, setForm] = useState<ProfileData>(blankForm());
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<SavedDraft | null>(null);
  const [discardingDraft, setDiscardingDraft] = useState(false);
  const startedUnauthenticated = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      startedUnauthenticated.current = true;
      setProfileState({ status: "unauthenticated" });
      return;
    }
    if (startedUnauthenticated.current) {
      router.push("/");
      return;
    }

    getAccessToken().then(async (token) => {
      if (!token) { setProfileState({ status: "unauthenticated" }); return; }
      try {
        const [row, savedDraft] = await Promise.all([
          getProfile(token),
          getMyDraft(token).catch(() => null),
        ]);
        setDraft(savedDraft);
        if (row) {
          const data = rowToForm(row);
          setForm(data);
          setProfileState({ status: "ready", data });
        } else {
          setProfileState({ status: "ready", data: null });
        }
      } catch (e) {
        setProfileState({ status: "error", message: String(e) });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  async function handleDiscardDraft() {
    setDiscardingDraft(true);
    const token = await getAccessToken();
    if (token) await discardDraft(token).catch(() => {});
    setDraft(null);
    setDiscardingDraft(false);
  }

  function handleSave(data: ProfileData, onSuccess: () => void) {
    startTransition(async () => {
      const token = await getAccessToken();
      if (!token) return;

      const input: ProfileInput = {
        name: data.name,
        type: data.type,
        country: data.country,
        city: data.city || undefined,
        bio: data.bio,
        website: data.website || undefined,
        yearEstablished: data.yearEstablished ? Number(data.yearEstablished) : undefined,
        contributors: data.contributors,
      };

      try {
        const { slug } = await saveProfile(token, input);
        const updated = { ...data, slug };
        setForm(updated);
        setProfileState({ status: "ready", data: updated });
        onSuccess();
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
            <div key={i} className="h-12 animate-pulse bg-gray-100" />
          ))}
        </div>
      </main>
    );
  }

  if (profileState.status === "unauthenticated") {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-3 text-gray-500">Sign in to view your profile and manage competitions.</p>
        <Button onClick={login} className="mt-6">Sign in</Button>
      </main>
    );
  }

  if (profileState.status === "error") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="bg-red-50 p-4 text-sm text-red-700">{profileState.message}</div>
      </main>
    );
  }

  return (
    <ProfilePage
      initialForm={form}
      isNew={!form.slug}
      draft={draft}
      startEditing={startInEdit}
      onSave={handleSave}
      onDiscardDraft={handleDiscardDraft}
      discardingDraft={discardingDraft}
      isPending={isPending}
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}
