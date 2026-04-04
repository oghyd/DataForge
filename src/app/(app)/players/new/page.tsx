import { PlayerForm } from "@/components/forms/player-form";

export default function NewPlayerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Player</h1>
        <p className="text-muted-foreground">Register a new football practitioner</p>
      </div>
      <PlayerForm />
    </div>
  );
}
