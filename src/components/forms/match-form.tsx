"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMatch } from "@/services/match-actions";
import { MATCH_STATUSES } from "@/lib/utils";

interface MatchFormProps {
  teams: { id: string; name: string; club: { name: string; shortName: string | null } }[];
  seasons: { id: string; name: string }[];
  competitions: { id: string; name: string }[];
  venues: { id: string; name: string }[];
}

export function MatchForm({ teams, seasons, competitions, venues }: MatchFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { title: "Teams & Schedule", description: "Who plays when and where" },
    { title: "Result", description: "Score and match outcome" },
    { title: "Conditions", description: "Weather, pitch, referee" },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      data[key] = value === "" ? null : value;
    });

    const result = await createMatch(data);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/matches/${result.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Progress Steps */}
      <div className="mb-6 flex gap-2">
        {sections.map((section, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentSection(i)}
            className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
              currentSection === i ? "border-primary bg-primary/5" : "hover:bg-accent/50"
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">Step {i + 1}</p>
            <p className="text-sm font-medium">{section.title}</p>
          </button>
        ))}
      </div>

      {/* Section 1: Teams & Schedule */}
      <div className={currentSection === 0 ? "" : "hidden"}>
        <Card>
          <CardHeader><CardTitle>Teams & Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeamId">Home team *</Label>
                <Select id="homeTeamId" name="homeTeamId" required>
                  <option value="">Select home team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.club.shortName || t.club.name} — {t.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayTeamId">Away team *</Label>
                <Select id="awayTeamId" name="awayTeamId" required>
                  <option value="">Select away team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.club.shortName || t.club.name} — {t.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matchDate">Match date *</Label>
                <Input id="matchDate" name="matchDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kickoffTime">Kickoff time</Label>
                <Input id="kickoffTime" name="kickoffTime" type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seasonId">Season</Label>
                <Select id="seasonId" name="seasonId">
                  <option value="">Select season</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitionId">Competition</Label>
                <Select id="competitionId" name="competitionId">
                  <option value="">Select competition</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueId">Venue</Label>
                <Select id="venueId" name="venueId">
                  <option value="">Select venue</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matchDay">Match day / round</Label>
                <Input id="matchDay" name="matchDay" type="number" min="1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Result */}
      <div className={currentSection === 1 ? "" : "hidden"}>
        <Card>
          <CardHeader><CardTitle>Match Result</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Match status</Label>
              <Select id="status" name="status" defaultValue="COMPLETED">
                {MATCH_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">Home score</Label>
                <Input id="homeScore" name="homeScore" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayScore">Away score</Label>
                <Input id="awayScore" name="awayScore" type="number" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeHalfTimeScore">Home half-time score</Label>
                <Input id="homeHalfTimeScore" name="homeHalfTimeScore" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayHalfTimeScore">Away half-time score</Label>
                <Input id="awayHalfTimeScore" name="awayHalfTimeScore" type="number" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homePenaltyScore">Home penalty score</Label>
                <Input id="homePenaltyScore" name="homePenaltyScore" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayPenaltyScore">Away penalty score</Label>
                <Input id="awayPenaltyScore" name="awayPenaltyScore" type="number" min="0" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Conditions */}
      <div className={currentSection === 2 ? "" : "hidden"}>
        <Card>
          <CardHeader><CardTitle>Match Conditions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weather">Weather</Label>
                <Select id="weather" name="weather">
                  <option value="">Select weather</option>
                  <option value="CLEAR">Clear</option>
                  <option value="CLOUDY">Cloudy</option>
                  <option value="RAINY">Rainy</option>
                  <option value="WINDY">Windy</option>
                  <option value="HOT">Hot</option>
                  <option value="COLD">Cold</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pitchCondition">Pitch condition</Label>
                <Select id="pitchCondition" name="pitchCondition">
                  <option value="">Select condition</option>
                  <option value="GOOD">Good</option>
                  <option value="WET">Wet</option>
                  <option value="DRY">Dry</option>
                  <option value="MUDDY">Muddy</option>
                  <option value="POOR">Poor</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refereeName">Referee</Label>
                <Input id="refereeName" name="refereeName" placeholder="Referee name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance">Attendance</Label>
                <Input id="attendance" name="attendance" type="number" min="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Match notes</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Any additional notes about the match..." />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentSection < sections.length - 1 ? (
            <Button type="button" onClick={() => setCurrentSection(currentSection + 1)}>Next</Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Match"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
