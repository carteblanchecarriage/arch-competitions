---
title: "Anonymous Judging"
order: 6
description: "How submitter identity is hidden from the jury until announcement — enforced at the database level, not just promised."
---

## Why

The [UIA Accord on Competitions](https://www.uia-architectes.org/en/activity/competitions/) requires jury members to evaluate submissions without knowing who made them. Most platforms rely on organizers to honour this voluntarily. We enforce it at the server layer instead.

## How it works

### 1. Anonymous ID assignment

When a submitter first finalises their entry (`submit: true` in `saveEntry`), the server assigns an `anonymous_id`:

```typescript
// src/app/actions/entry.ts
async function assignAnonymousId(db, competitionId): Promise<string> {
  const { count } = await db
    .from("entries")
    .select("id", { count: "exact", head: true })
    .eq("competition_id", competitionId)
    .not("anonymous_id", "is", null);
  const n = (count ?? 0) + 1;
  return `E-${String(n).padStart(4, "0")}`;
}
```

IDs look like `E-0001`, `E-0002`, etc. The ID is assigned once and preserved on all subsequent saves. Draft entries don't get one.

The `anonymous_id` column has a partial unique index: `UNIQUE (competition_id, anonymous_id) WHERE anonymous_id IS NOT NULL`.

### 2. Query-level stripping

`getCompetitionEntries` (the action the organizer dashboard calls) checks competition status before selecting submitter fields:

```typescript
const announced = comp.status === "announced";

const { data: entries } = await db
  .from("entries")
  .select(announced
    ? "*, submitter:submitters(slug, name, country, type)"
    : "id, anonymous_id, title, description, project_url, files, status, submitted_at, created_at"
  )
  ...
```

When `status !== "announced"`, the query never touches the `submitters` table. Submitter identity is absent from the response object entirely — it's not present to strip on the frontend.

### 3. Dashboard UI

The organizer dashboard shows:
- Anonymous ID per entry (`E-0001`) in mono font
- "Identity hidden" label where the submitter name column would be
- A notice banner: *"Anonymous judging active — submitter identities are hidden until you announce winners"*

After `announceWinners()` flips the competition to `announced`, the next dashboard load returns full submitter info.

### 4. Public competition page

The competition detail page shows a green "✓ Anonymous Judging" block explaining the guarantee to submitters before they enter.

---

## What this does not cover

- The organizer knows **which submitter registered** (via `registrations` table). Registration is separate from submission and is not anonymised.
- If a submitter includes their name in their project title or description, the anonymous ID doesn't help. Brief standards should advise against this.
- The `anonymous_id` is sequential and reveals **submission order**. This is intentional — submission timing is not sensitive, only identity is.

---

## Revealing identities

Identity is automatically restored when the organizer calls `announceWinners()` and competition status becomes `announced`. No manual reveal step is needed — the query logic switches automatically.
