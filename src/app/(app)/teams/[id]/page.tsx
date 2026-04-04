import { getTeam } from "@/services/team-actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Swords, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, POSITIONS } from "@/lib/utils";

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const team = await getTeam(params.id);
  if (!team) return notFound();

  const allMatches = [...team.homeMatches, ...team.awayMatches].sort(
    (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/teams">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-muted-foreground">{team.club.name}</span>
              {team.ageGroup && <Badge variant="outline">{team.ageGroup}</Badge>}
              <Badge variant="secondary">{team.gender}</Badge>
              {team.formation && <Badge variant="info">{team.formation}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{team.playerAssignments.length}</p>
              <p className="text-xs text-muted-foreground">Squad size</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Swords className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{allMatches.length}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {team.season?.name?.split("-")[0] || "—"}
            </div>
            <div>
              <p className="text-lg font-bold">{team.season?.name || "No season"}</p>
              <p className="text-xs text-muted-foreground">Current season</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Squad */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Squad ({team.playerAssignments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {team.playerAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No players assigned to this team yet</p>
            ) : (
              <div className="space-y-2">
                {team.playerAssignments.map((pa) => (
                  <Link
                    key={pa.id}
                    href={`/players/${pa.playerId}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {pa.jerseyNumber ?? "—"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{pa.player.firstName} {pa.player.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {pa.player.primaryPosition ? POSITIONS[pa.player.primaryPosition] || pa.player.primaryPosition : "No position"}
                        </p>
                      </div>
                    </div>
                    {pa.role !== "PLAYER" && <Badge variant="outline" className="text-[10px]">{pa.role}</Badge>}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Matches</CardTitle>
            <Link href={`/matches/new?teamId=${team.id}`}>
              <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Record Match</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {allMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches recorded</p>
            ) : (
              <div className="space-y-2">
                {allMatches.slice(0, 10).map((match) => {
                  const isHome = match.homeTeamId === team.id;
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {isHome ? (
                            <>{team.name} vs {(match as Record<string, unknown> & { awayTeam?: { name: string } }).awayTeam?.name || "Away"}</>
                          ) : (
                            <>{(match as Record<string, unknown> & { homeTeam?: { name: string } }).homeTeam?.name || "Home"} vs {team.name}</>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(match.matchDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.homeScore !== null && (
                          <span className="font-bold text-sm">{match.homeScore} - {match.awayScore}</span>
                        )}
                        <Badge
                          variant={match.status === "COMPLETED" ? "success" : match.status === "SCHEDULED" ? "info" : "secondary"}
                          className="text-[10px]"
                        >
                          {match.status}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
