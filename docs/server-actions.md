---
title: "Server Actions"
order: 5
description: "All server actions — what they do, who can call them, and where to find them."
---

All server actions live in `src/app/actions/`. They are Next.js server actions (`"use server"`) called directly from client components. Each action that mutates data requires a Privy access token as its first argument.

---

## competition.ts

| Action | Auth | Description |
|---|---|---|
| `createCompetition(token, input)` | Organizer | Creates a competition record and deploys a CompetitionEscrow contract. Returns the new competition slug. |
| `publishCompetition(token, slug)` | Organizer (owner) | Moves a funded draft from `draft` → `open`. Validates escrow has funds before publishing. |
| `saveDraft(token, slug, input)` | Organizer (owner) | Saves changes to a draft competition without publishing. |

## entry.ts

| Action | Auth | Description |
|---|---|---|
| `getMyEntry(token, competitionId)` | Submitter | Returns the caller's entry for a competition, or null. |
| `saveEntry(token, competitionId, input, submit)` | Submitter | Upserts an entry. Pass `submit: true` to finalise. Assigns `anonymous_id` on first submission. |
| `setEntryVisibility(token, entryId, hidden)` | Submitter (owner) | Show or hide entry from public gallery. Winning entries cannot be hidden. |

## organizer.ts

| Action | Auth | Description |
|---|---|---|
| `getMyOrganizer(token)` | Organizer | Returns the caller's organizer record, or null. |
| `getOrganizerDashboard(token)` | Organizer | Returns all competitions for the caller with entry counts. |
| `getCompetitionEntries(token, competitionId)` | Organizer (owner) | Returns all non-withdrawn entries. **Submitter identity is stripped when status ≠ `announced`** — anonymous judging enforcement. |
| `announceWinners(token, competitionId, picks, jurySummary?)` | Organizer (owner) | Saves winner selections, moves competition to `announced`. |
| `updateCompetitionDeadline(token, competitionId, newDeadline)` | Organizer (owner) | Extend deadline. Rules: any change within 24h of creation; extension-only after that, capped at 90 days past original. |

## profile.ts

| Action | Auth | Description |
|---|---|---|
| `getMyProfile(token)` | Any | Returns the caller's organizer or submitter record. |
| `updateProfile(token, input)` | Any | Upsert profile. Creates record on first call. |

## registration.ts

| Action | Auth | Description |
|---|---|---|
| `registerForCompetition(token, competitionId)` | Submitter | Register intent to submit. Records wallet address at registration time for lapse protection. |
| `getMyRegistration(token, competitionId)` | Submitter | Returns registration status for one competition. |

## questions.ts

| Action | Auth | Description |
|---|---|---|
| `askQuestion(token, competitionId, question)` | Submitter | Submit a question to the organizer. |
| `answerQuestion(token, questionId, answer)` | Organizer (owner) | Answer a question and make it public. |
| `getQuestions(competitionId)` | Public | Returns all public Q&A for a competition. |

## draft.ts

| Action | Auth | Description |
|---|---|---|
| `saveDraftCompetition(token, input)` | Organizer | Save competition data without triggering escrow deployment. |

---

## Error handling pattern

All actions throw a plain `Error` with a human-readable message. Client components catch these and surface them in the UI:

```typescript
try {
  await someAction(token, args);
} catch (e) {
  setError(e instanceof Error ? e.message : "Something went wrong.");
}
```

Actions never return error objects — a thrown error always means the operation did not complete.
