import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle, XCircle, Users, Swords } from "lucide-react";
import Link from "next/link";

async function getDataQualityStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const players = await prisma.player.findMany({
    select: {
      id: true, firstName: true, lastName: true, dateOfBirth: true, gender: true,
      nationality: true, email: true, phone: true, preferredFoot: true,
      primaryPosition: true, height: true, weight: true, photoUrl: true,
      city: true, country: true, status: true,
    },
  });

  const matches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    select: {
      id: true, homeScore: true, awayScore: true, attendance: true,
      weather: true, refereeName: true, venueId: true,
      _count: { select: { teamStats: true, playerStats: true, events: true } },
      homeTeam: { select: { name: true, club: { select: { name: true } } } },
      awayTeam: { select: { name: true, club: { select: { name: true } } } },
    },
  });

  const playerFields = ["dateOfBirth", "nationality", "email", "phone", "preferredFoot", "primaryPosition", "height", "weight", "photoUrl", "city"];
  const playersWithIssues = players.map((p) => {
    const missing = playerFields.filter((f) => {
      const val = (p as Record<string, unknown>)[f];
      return val === null || val === undefined || val === "";
    });
    return { ...p, missingFields: missing, completeness: Math.round(((playerFields.length - missing.length) / playerFields.length) * 100) };
  });

  const matchesWithIssues = matches.map((m) => {
    const issues: string[] = [];
    if (m._count.teamStats === 0) issues.push("No team statistics");
    if (m._count.playerStats === 0) issues.push("No player statistics");
    if (m._count.events === 0) issues.push("No match events");
    if (!m.attendance) issues.push("Missing attendance");
    if (!m.weather) issues.push("Missing weather");
    if (!m.refereeName) issues.push("Missing referee");
    if (!m.venueId) issues.push("Missing venue");
    return { ...m, issues, completeness: Math.round(((7 - issues.length) / 7) * 100) };
  });

  const avgPlayerCompleteness = playersWithIssues.length > 0
    ? Math.round(playersWithIssues.reduce((s, p) => s + p.completeness, 0) / playersWithIssues.length)
    : 0;
  const avgMatchCompleteness = matchesWithIssues.length > 0
    ? Math.round(matchesWithIssues.reduce((s, m) => s + m.completeness, 0) / matchesWithIssues.length)
    : 0;

  const incompletePlayerCount = playersWithIssues.filter((p) => p.completeness < 100).length;
  const incompleteMatchCount = matchesWithIssues.filter((m) => m.completeness < 100).length;

  const issues = await prisma.dataQualityIssue.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    avgPlayerCompleteness,
    avgMatchCompleteness,
    incompletePlayerCount,
    incompleteMatchCount,
    playersWithIssues: playersWithIssues.filter((p) => p.completeness < 100).sort((a, b) => a.completeness - b.completeness).slice(0, 10),
    matchesWithIssues: matchesWithIssues.filter((m) => m.completeness < 100).sort((a, b) => a.completeness - b.completeness).slice(0, 10),
    totalPlayers: players.length,
    totalMatches: matches.length,
    issues,
  };
}

export default async function DataQualityPage() {
  const data = await getDataQualityStats();
  const overall = data.totalPlayers + data.totalMatches > 0
    ? Math.round(((data.avgPlayerCompleteness * data.totalPlayers) + (data.avgMatchCompleteness * data.totalMatches)) / (data.totalPlayers + data.totalMatches))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Quality</h1>
        <p className="text-sm text-muted-foreground">Monitor completeness, find gaps, and improve data reliability</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Overall</p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{overall}%</p>
            <Progress value={overall} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Player Data</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{data.avgPlayerCompleteness}%</p>
            <Progress value={data.avgPlayerCompleteness} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{data.incompletePlayerCount} incomplete profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Match Data</p>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{data.avgMatchCompleteness}%</p>
            <Progress value={data.avgMatchCompleteness} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{data.incompleteMatchCount} incomplete matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Open Issues</p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{data.issues.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Incomplete Player Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.playersWithIssues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> All player profiles are complete
              </div>
            ) : (
              <div className="space-y-3">
                {data.playersWithIssues.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/players/${p.id}`} className="text-sm font-medium hover:underline">
                        {p.firstName} {p.lastName}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.missingFields.slice(0, 4).map((f) => (
                          <Badge key={f} variant="outline" className="text-[10px] text-red-600 border-red-200">
                            <XCircle className="h-2.5 w-2.5 mr-0.5" /> {f}
                          </Badge>
                        ))}
                        {p.missingFields.length > 4 && (
                          <Badge variant="outline" className="text-[10px]">+{p.missingFields.length - 4} more</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{p.completeness}%</span>
                      <Progress value={p.completeness} className="mt-1 h-1.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Swords className="h-4 w-4" /> Incomplete Match Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.matchesWithIssues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> All match records are complete
              </div>
            ) : (
              <div className="space-y-3">
                {data.matchesWithIssues.map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/matches/${m.id}`} className="text-sm font-medium hover:underline">
                        {m.homeTeam.club.name} vs {m.awayTeam.club.name}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.issues.slice(0, 3).map((issue) => (
                          <Badge key={issue} variant="outline" className="text-[10px] text-amber-600 border-amber-200">
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {issue}
                          </Badge>
                        ))}
                        {m.issues.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">+{m.issues.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{m.completeness}%</span>
                      <Progress value={m.completeness} className="mt-1 h-1.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
