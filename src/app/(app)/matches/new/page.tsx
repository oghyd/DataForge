import { MatchForm } from "@/components/forms/match-form";
import { getTeams } from "@/services/team-actions";
import { getSeasons, getCompetitions, getVenues } from "@/services/match-actions";

export default async function NewMatchPage() {
  const [teams, seasons, competitions, venues] = await Promise.all([
    getTeams(),
    getSeasons(),
    getCompetitions(),
    getVenues(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Record Match</h1>
        <p className="text-muted-foreground">Add a played or scheduled match with statistics</p>
      </div>
      <MatchForm teams={teams} seasons={seasons} competitions={competitions} venues={venues} />
    </div>
  );
}
