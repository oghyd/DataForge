import { TeamForm } from "@/components/forms/team-form";
import { getClubs } from "@/services/team-actions";
import { getSeasons } from "@/services/match-actions";

export default async function NewTeamPage() {
  const [clubs, seasons] = await Promise.all([getClubs(), getSeasons()]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Team</h1>
        <p className="text-muted-foreground">Create a new team within a club</p>
      </div>
      <TeamForm clubs={clubs} seasons={seasons} />
    </div>
  );
}
