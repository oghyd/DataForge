"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createTeam } from "@/services/team-actions";
import { AGE_GROUPS } from "@/lib/utils";

interface TeamFormProps {
  clubs: { id: string; name: string; organizationId: string }[];
  seasons: { id: string; name: string }[];
}

export function TeamForm({ clubs, seasons }: TeamFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      data[key] = value === "" ? null : value;
    });

    const result = await createTeam(data);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/teams");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clubId">Club *</Label>
            <Select id="clubId" name="clubId" required>
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </Select>
            {clubs.length === 0 && (
              <p className="text-xs text-amber-600">No clubs found. Create a club from Organizations first.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Team name *</Label>
            <Input id="name" name="name" placeholder="e.g., U18 A, Senior First Team" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age group</Label>
              <Select id="ageGroup" name="ageGroup">
                <option value="">Select age group</option>
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" name="gender" defaultValue="MALE">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="MIXED">Mixed</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select id="level" name="level">
                <option value="">Select level</option>
                <option value="FIRST_TEAM">First Team</option>
                <option value="RESERVE">Reserve</option>
                <option value="YOUTH">Youth</option>
                <option value="ACADEMY">Academy</option>
                <option value="RECREATIONAL">Recreational</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seasonId">Season</Label>
              <Select id="seasonId" name="seasonId">
                <option value="">Select season</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="formation">Formation</Label>
            <Select id="formation" name="formation">
              <option value="">Select formation</option>
              <option value="4-3-3">4-3-3</option>
              <option value="4-4-2">4-4-2</option>
              <option value="3-5-2">3-5-2</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="3-4-3">3-4-3</option>
              <option value="5-3-2">5-3-2</option>
              <option value="4-1-4-1">4-1-4-1</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Team"}</Button>
      </div>
    </form>
  );
}
