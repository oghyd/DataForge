import { getMatch } from "@/services/match-actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, MapPin, Calendar, Clock, Cloud, User, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

function StatBar({ label, home, away }: { label: string; home: number | null; away: number | null }) {
  const h = home ?? 0;
  const a = away ?? 0;
  const total = h + a || 1;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
      <div className="flex items-center justify-end gap-2">
        <span className="font-medium">{h}</span>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary rounded-full ml-auto" style={{ width: `${(h / total) * 100}%` }} />
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center w-24">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(a / total) * 100}%` }} />
        </div>
        <span className="font-medium">{a}</span>
      </div>
    </div>
  );
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id);
  if (!match) return notFound();

  const hs = match.homeStats;
  const as = match.awayStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/matches">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Badge variant={match.status === "COMPLETED" ? "success" : match.status === "SCHEDULED" ? "info" : "secondary"}>
                {match.status}
              </Badge>
              {match.competition && (
                <span className="text-sm text-muted-foreground">{match.competition.name}</span>
              )}
              {match.season && (
                <span className="text-sm text-muted-foreground">{match.season.name}</span>
              )}
            </div>
          </div>
        </div>
        <Link href={`/matches/${match.id}/edit`}>
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold mx-auto">
                {(match.homeTeam.club?.shortName || match.homeTeam.name).slice(0, 3).toUpperCase()}
              </div>
              <Link href={`/teams/${match.homeTeamId}`}>
                <h2 className="mt-2 text-lg font-bold hover:text-primary">{match.homeTeam.club?.name || match.homeTeam.name}</h2>
              </Link>
              <p className="text-sm text-muted-foreground">{match.homeTeam.name}</p>
            </div>

            <div className="text-center">
              <div className="rounded-xl bg-muted px-8 py-4">
                {match.homeScore !== null ? (
                  <p className="text-4xl font-bold">{match.homeScore} - {match.awayScore}</p>
                ) : (
                  <p className="text-2xl text-muted-foreground">vs</p>
                )}
                {match.homeHalfTimeScore !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    HT: {match.homeHalfTimeScore} - {match.awayHalfTimeScore}
                  </p>
                )}
                {match.homePenaltyScore !== null && (
                  <p className="text-sm text-muted-foreground">
                    Pen: {match.homePenaltyScore} - {match.awayPenaltyScore}
                  </p>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{formatDate(match.matchDate)}</p>
            </div>

            <div className="text-center flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-xl font-bold mx-auto">
                {(match.awayTeam.club?.shortName || match.awayTeam.name).slice(0, 3).toUpperCase()}
              </div>
              <Link href={`/teams/${match.awayTeamId}`}>
                <h2 className="mt-2 text-lg font-bold hover:text-primary">{match.awayTeam.club?.name || match.awayTeam.name}</h2>
              </Link>
              <p className="text-sm text-muted-foreground">{match.awayTeam.name}</p>
            </div>
          </div>

          {/* Match Info Bar */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {match.venue && (
              <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {match.venue.name}</div>
            )}
            <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(match.matchDate)}</div>
            {match.kickoffTime && (
              <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {match.kickoffTime}</div>
            )}
            {match.weather && (
              <div className="flex items-center gap-1"><Cloud className="h-3.5 w-3.5" /> {match.weather}</div>
            )}
            {match.refereeName && (
              <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {match.refereeName}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completeness */}
      <Card className={match.completeness < 50 ? "border-amber-200 bg-amber-50/50" : ""}>
        <CardContent className="flex items-center gap-4 py-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Match Data Completeness</span>
              <span className="text-sm font-bold">{match.completeness}%</span>
            </div>
            <Progress value={match.completeness} />
          </div>
          {match.completeness < 60 && (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Add team stats and player stats to improve</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Stats Comparison */}
      {(hs || as) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatBar label="Possession %" home={hs?.possession ?? null} away={as?.possession ?? null} />
            <StatBar label="Total Shots" home={hs?.shots ?? null} away={as?.shots ?? null} />
            <StatBar label="On Target" home={hs?.shotsOnTarget ?? null} away={as?.shotsOnTarget ?? null} />
            <StatBar label="Passes" home={hs?.totalPasses ?? null} away={as?.totalPasses ?? null} />
            <StatBar label="Pass Accuracy %" home={hs?.passAccuracy ?? null} away={as?.passAccuracy ?? null} />
            <StatBar label="Corners" home={hs?.corners ?? null} away={as?.corners ?? null} />
            <StatBar label="Fouls" home={hs?.fouls ?? null} away={as?.fouls ?? null} />
            <StatBar label="Yellow Cards" home={hs?.yellowCards ?? null} away={as?.yellowCards ?? null} />
            <StatBar label="Red Cards" home={hs?.redCards ?? null} away={as?.redCards ?? null} />
            <StatBar label="Offsides" home={hs?.offsides ?? null} away={as?.offsides ?? null} />
            <StatBar label="Tackles" home={hs?.tackles ?? null} away={as?.tackles ?? null} />
            <StatBar label="Interceptions" home={hs?.interceptions ?? null} away={as?.interceptions ?? null} />
            <StatBar label="Clearances" home={hs?.clearances ?? null} away={as?.clearances ?? null} />
            <StatBar label="Saves" home={hs?.saves ?? null} away={as?.saves ?? null} />
            <StatBar label="Duels Won" home={hs?.duelsWon ?? null} away={as?.duelsWon ?? null} />
            <StatBar label="Dribbles" home={hs?.dribbles ?? null} away={as?.dribbles ?? null} />
            <StatBar label="Crosses" home={hs?.crosses ?? null} away={as?.crosses ?? null} />
            <StatBar label="Ball Recoveries" home={hs?.ballRecoveries ?? null} away={as?.ballRecoveries ?? null} />
          </CardContent>
        </Card>
      )}

      {/* Match Events Timeline */}
      {match.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {match.events.map((event) => {
                const icons: Record<string, string> = {
                  GOAL: "&#9917;", OWN_GOAL: "&#9917;", YELLOW_CARD: "&#128995;",
                  RED_CARD: "&#128308;", SECOND_YELLOW: "&#128995;",
                  SUBSTITUTION_IN: "&#8593;", SUBSTITUTION_OUT: "&#8595;",
                  PENALTY_SCORED: "P&#9917;", PENALTY_MISSED: "Px",
                };
                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 rounded-lg border p-2 ${
                      event.teamSide === "HOME" ? "mr-auto max-w-[70%]" : "ml-auto max-w-[70%] text-right flex-row-reverse"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-mono">
                      {event.minute}&apos;
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <span dangerouslySetInnerHTML={{ __html: icons[event.type] || "" }} />{" "}
                        {event.type.replace(/_/g, " ")}
                      </p>
                      {event.player && (
                        <p className="text-xs text-muted-foreground">{event.player.firstName} {event.player.lastName}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: `${match.homeTeam.club?.name || match.homeTeam.name} Players`, stats: match.homePlayerStats },
          { title: `${match.awayTeam.club?.name || match.awayTeam.name} Players`, stats: match.awayPlayerStats },
        ].map((side) => (
          <Card key={side.title}>
            <CardHeader>
              <CardTitle className="text-base">{side.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {side.stats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No player stats recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="p-1.5 text-left font-medium">Player</th>
                        <th className="p-1.5 font-medium">Mins</th>
                        <th className="p-1.5 font-medium">G</th>
                        <th className="p-1.5 font-medium">A</th>
                        <th className="p-1.5 font-medium">Shots</th>
                        <th className="p-1.5 font-medium">Pass</th>
                        <th className="p-1.5 font-medium">Tkl</th>
                        <th className="p-1.5 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {side.stats.map((ps) => (
                        <tr key={ps.id} className="border-b last:border-0">
                          <td className="p-1.5">
                            <Link href={`/players/${ps.playerId}`} className="text-primary hover:underline">
                              {ps.player.firstName[0]}. {ps.player.lastName}
                            </Link>
                            {ps.starter && <span className="ml-1 text-[10px] text-muted-foreground">(S)</span>}
                            {ps.isCaptain && <span className="ml-1 text-[10px]">C</span>}
                          </td>
                          <td className="p-1.5 text-center">{ps.minutesPlayed ?? "—"}</td>
                          <td className="p-1.5 text-center font-medium">{ps.goals || "—"}</td>
                          <td className="p-1.5 text-center">{ps.assists || "—"}</td>
                          <td className="p-1.5 text-center">{ps.shots ?? "—"}</td>
                          <td className="p-1.5 text-center">{ps.accuratePasses != null ? `${ps.accuratePasses}/${ps.passes}` : "—"}</td>
                          <td className="p-1.5 text-center">{ps.tackles ?? "—"}</td>
                          <td className="p-1.5 text-center">
                            {ps.rating ? (
                              <span className={`font-medium ${ps.rating >= 7 ? "text-green-600" : ps.rating >= 5 ? "text-amber-600" : "text-red-600"}`}>
                                {ps.rating.toFixed(1)}
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provenance */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Created by {match.createdBy?.name || "System"} on {formatDate(match.createdAt)}</span>
            {match.updatedBy && <span>Last updated by {match.updatedBy.name} on {formatDate(match.updatedAt)}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
