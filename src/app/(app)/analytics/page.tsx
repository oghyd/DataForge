import { getDashboardStats } from "@/services/dashboard-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform-wide data insights and coverage analysis</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{stats.totalPlayers}</p>
            <p className="text-xs text-muted-foreground">Total Practitioners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{stats.totalTeams}</p>
            <p className="text-xs text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{stats.completedMatches}</p>
            <p className="text-xs text-muted-foreground">Matches Recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{stats.totalClubs}</p>
            <p className="text-xs text-muted-foreground">Clubs</p>
          </CardContent>
        </Card>
        <Card className={stats.overallCompleteness < 50 ? "border-amber-200" : ""}>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{stats.overallCompleteness}%</p>
            <p className="text-xs text-muted-foreground">Data Completeness</p>
            <Progress value={stats.overallCompleteness} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Data Coverage Analysis
          </CardTitle>
          <CardDescription>Identifying gaps in your football practitioner data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Players with position",
                current: stats.positionDistribution.reduce((sum, p) => sum + p.count, 0),
                total: stats.totalPlayers,
              },
              {
                label: "Completed matches",
                current: stats.completedMatches,
                total: stats.totalMatches || 1,
              },
              {
                label: "Active players",
                current: stats.activePlayers,
                total: stats.totalPlayers || 1,
              },
              {
                label: "Profile completeness",
                current: stats.overallCompleteness,
                total: 100,
              },
            ].map((metric) => {
              const pct = Math.round((metric.current / metric.total) * 100);
              return (
                <div key={metric.label} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{metric.label}</p>
                    <span className="text-sm font-bold">{pct}%</span>
                  </div>
                  <Progress value={pct} className={pct < 50 ? "[&>div]:bg-amber-500" : ""} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {metric.current} / {metric.total}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <AnalyticsCharts
        positionDistribution={stats.positionDistribution}
        monthlyGrowth={stats.monthlyGrowth}
        playersByStatus={stats.playersByStatus}
      />
    </div>
  );
}
