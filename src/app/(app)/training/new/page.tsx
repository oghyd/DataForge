import { getTeamsForSelect } from "@/services/training-actions";
import { TrainingForm } from "@/components/forms/training-form";

export default async function NewTrainingPage() {
  const teams = await getTeamsForSelect();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Training Session</h1>
      <TrainingForm teams={teams.map((t) => ({ id: t.id, label: `${t.club.name} — ${t.name}` }))} />
    </div>
  );
}
