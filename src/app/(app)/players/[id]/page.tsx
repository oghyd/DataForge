import { getPlayer } from "@/services/player-actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { POSITIONS, formatDate, calculateAge } from "@/lib/utils";
import { Edit, ArrowLeft, Target, Swords, Clock, Award, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id);
  if (!player) return notFound();

  const age = calculateAge(player.dateOfBirth);

  const statusColor = {
    ACTIVE: "success" as const,
    INJURED: "destructive" as const,
    SUSPENDED: "warning" as const,
    DRAFT: "warning" as const,
    INACTIVE: "secondary" as const,
    TRANSFERRED: "info" as const,
    RETIRED: "secondary" as const,
    ARCHIVED: "secondary" as const,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/players">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {player.firstName[0]}{player.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{player.firstName} {player.lastName}</h1>
            <div className="mt-1 flex items-center gap-3">
              {player.primaryPosition && (
                <Badge variant="outline">{POSITIONS[player.primaryPosition] || player.primaryPosition}</Badge>
              )}
              <Badge variant={statusColor[player.status as keyof typeof statusColor] || "secondary"}>
                {player.status}
              </Badge>
              <Badge variant={player.verificationStatus === "VERIFIED" ? "success" : "outline"}>
                {player.verificationStatus}
              </Badge>
              {age !== null && <span className="text-sm text-muted-foreground">{age} years old</span>}
            </div>
          </div>
        </div>
        <Link href={`/players/${player.id}/edit`}>
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      {/* Completeness Banner */}
      <Card className={player.completeness < 50 ? "border-amber-200 bg-amber-50/50" : ""}>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm font-bold">{player.completeness}%</span>
            </div>
            <Progress value={player.completeness} />
          </div>
          {player.completeness < 80 && (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Missing data — improve the profile quality</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Swords className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{player.stats.totalMatches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{player.stats.totalGoals}</p>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{player.stats.totalAssists}</p>
              <p className="text-xs text-muted-foreground">Assists</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{player.stats.totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {[
                ["Date of Birth", player.dateOfBirth ? `${formatDate(player.dateOfBirth)} (${age} years)` : null],
                ["Gender", player.gender],
                ["Nationality", player.nationality],
                ["Second Nationality", player.secondNationality],
                ["National ID", player.nationalId],
                ["City", player.city],
                ["Region", player.region],
                ["Country", player.country],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={value ? "font-medium" : "text-muted-foreground/50"}>{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Football Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Football Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {[
                ["Primary Position", player.primaryPosition ? POSITIONS[player.primaryPosition] || player.primaryPosition : null],
                ["Secondary Position", player.secondaryPosition ? POSITIONS[player.secondaryPosition] || player.secondaryPosition : null],
                ["Preferred Foot", player.preferredFoot],
                ["Height", player.height ? `${player.height} cm` : null],
                ["Weight", player.weight ? `${player.weight} kg` : null],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={value ? "font-medium" : "text-muted-foreground/50"}>{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {[
                ["Email", player.email],
                ["Phone", player.phone],
                ["Address", player.address],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={value ? "font-medium" : "text-muted-foreground/50"}>{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>
            {(player.guardianName || player.guardianPhone) && (
              <div className="mt-4 rounded-lg border bg-amber-50/50 p-3">
                <p className="text-xs font-semibold text-amber-800 mb-2">Guardian</p>
                <dl className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{player.guardianName || "—"}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{player.guardianPhone || "—"}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{player.guardianEmail || "—"}</dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team History</CardTitle>
          </CardHeader>
          <CardContent>
            {player.teamAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team assignments yet</p>
            ) : (
              <div className="space-y-3">
                {player.teamAssignments.map((ta) => (
                  <div key={ta.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{ta.team.name}</p>
                      <p className="text-xs text-muted-foreground">{ta.team.club?.name}</p>
                    </div>
                    <div className="text-right">
                      {ta.jerseyNumber && <Badge variant="outline">#{ta.jerseyNumber}</Badge>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(ta.startDate)} — {ta.endDate ? formatDate(ta.endDate) : "Present"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {player.matchStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No match data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2 font-medium">Match</th>
                    <th className="p-2 font-medium">Date</th>
                    <th className="p-2 font-medium">Mins</th>
                    <th className="p-2 font-medium">Goals</th>
                    <th className="p-2 font-medium">Assists</th>
                    <th className="p-2 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {player.matchStats.map((ms) => (
                    <tr key={ms.id} className="border-b last:border-0">
                      <td className="p-2">
                        <Link href={`/matches/${ms.matchId}`} className="text-primary hover:underline">
                          {ms.match.homeTeam.name} vs {ms.match.awayTeam.name}
                        </Link>
                      </td>
                      <td className="p-2 text-muted-foreground">{formatDate(ms.match.matchDate)}</td>
                      <td className="p-2">{ms.minutesPlayed ?? "—"}</td>
                      <td className="p-2 font-medium">{ms.goals}</td>
                      <td className="p-2">{ms.assists}</td>
                      <td className="p-2">{ms.rating ? `${ms.rating}/10` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provenance */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Created by {player.createdBy?.name || "System"} on {formatDate(player.createdAt)}</span>
            <span>Last updated by {player.updatedBy?.name || "System"} on {formatDate(player.updatedAt)}</span>
            <span>Source: {player.dataSource || "Manual"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
