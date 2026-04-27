import { getAllCompetitions } from "@/data/db";
import { CompetitionsBrowser } from "@/components/competitions/CompetitionsBrowser";

export default async function CompetitionsPage() {
  const competitions = await getAllCompetitions();
  return <CompetitionsBrowser competitions={competitions} />;
}
