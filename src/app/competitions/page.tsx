import { getAllCompetitions } from "@/data/db";
import { CompetitionsBrowser } from "@/components/competitions/CompetitionsBrowser";

export default async function CompetitionsPage() {
  const competitions = await getAllCompetitions().catch(() => []);
  return <CompetitionsBrowser competitions={competitions} />;
}
