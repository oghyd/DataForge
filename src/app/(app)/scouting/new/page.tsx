import { getPlayersForSelect } from "@/services/scouting-actions";
import { ScoutingForm } from "@/components/forms/scouting-form";

export default async function NewScoutReportPage() {
  const players = await getPlayersForSelect();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Scouting Report</h1>
      <ScoutingForm
        players={players.map((p) => ({
          id: p.id,
          label: `${p.firstName} ${p.lastName}${p.primaryPosition ? ` (${p.primaryPosition})` : ""}`,
        }))}
      />
    </div>
  );
}
