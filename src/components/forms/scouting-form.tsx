"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createScoutReport } from "@/services/scouting-actions";

interface ScoutingFormProps {
  players: { id: string; label: string }[];
}

export function ScoutingForm({ players }: ScoutingFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((v, k) => { data[k] = v === "" ? null : v; });

    const result = await createScoutReport(data);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/scouting");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <Card>
        <CardHeader><CardTitle>Player Evaluation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerId">Player *</Label>
            <Select id="playerId" name="playerId" required>
              <option value="">Select a player</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overallRating">Overall Rating (1-10)</Label>
              <Input id="overallRating" name="overallRating" type="number" min="1" max="10" step="0.5" placeholder="e.g., 7.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="potentialRating">Potential Rating (1-10)</Label>
              <Input id="potentialRating" name="potentialRating" type="number" min="1" max="10" step="0.5" placeholder="e.g., 8.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentLevel">Current Level</Label>
              <Select id="currentLevel" name="currentLevel">
                <option value="">Select level</option>
                <option value="BEGINNER">Beginner</option>
                <option value="AMATEUR">Amateur</option>
                <option value="SEMI_PRO">Semi-Pro</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ELITE">Elite</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendedLevel">Recommended Level</Label>
              <Select id="recommendedLevel" name="recommendedLevel">
                <option value="">Select level</option>
                <option value="BEGINNER">Beginner</option>
                <option value="AMATEUR">Amateur</option>
                <option value="SEMI_PRO">Semi-Pro</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ELITE">Elite</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommendation">Recommendation</Label>
            <Select id="recommendation" name="recommendation">
              <option value="">Select recommendation</option>
              <option value="SIGN">Sign</option>
              <option value="TRIAL">Trial</option>
              <option value="MONITOR">Monitor</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="REJECT">Reject</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea id="strengths" name="strengths" placeholder="Key strengths observed..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weaknesses">Weaknesses</Label>
            <Textarea id="weaknesses" name="weaknesses" placeholder="Areas for improvement..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" placeholder="Overall assessment..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="e.g., fast, technical, leader" />
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Report"}</Button>
      </div>
    </form>
  );
}
