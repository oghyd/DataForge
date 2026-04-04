import { getDashboardStats } from "@/services/dashboard-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Shield, Swords, BarChart3, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate, POSITIONS } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Football practitioner data overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/players/new">
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Player</Button>
          </Link>
          <Link href="/matches/new">
            <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> Record Match</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">{stats.activePlayers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">{stats.totalClubs} clubs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matches</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">{stats.completedMatches} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Completeness</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overallCompleteness}%</div>
            <Progress value={stats.overallCompleteness} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <DashboardCharts
            positionDistribution={stats.positionDistribution}
            monthlyGrowth={stats.monthlyGrowth}
          />
        </div>

        <div className="space-y-6 lg:col-span-3">
          {/* Recent Players */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Players</CardTitle>
              <Link href="/players" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentPlayers.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No players yet</p>
                  <Link href="/players/new">
                    <Button size="sm" variant="outline" className="mt-2">
                      <Plus className="mr-1 h-3 w-3" /> Add first player
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentPlayers.map((player) => (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{player.firstName} {player.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {player.primaryPosition ? POSITIONS[player.primaryPosition] || player.primaryPosition : "No position"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={player.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                          {player.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(player.createdAt)}
                        </span>
                      </div>
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
              <Link href="/matches" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentMatches.length === 0 ? (
                <div className="py-8 text-center">
                  <Swords className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No matches recorded</p>
                  <Link href="/matches/new">
                    <Button size="sm" variant="outline" className="mt-2">
                      <Plus className="mr-1 h-3 w-3" /> Record first match
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{match.homeTeam.club?.shortName || match.homeTeam.name}</span>
                          <span className="text-muted-foreground">
                            {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                          </span>
                          <span className="font-medium">{match.awayTeam.club?.shortName || match.awayTeam.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(match.matchDate)}</p>
                      </div>
                      <Badge
                        variant={
                          match.status === "COMPLETED" ? "success" :
                          match.status === "SCHEDULED" ? "info" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {match.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
