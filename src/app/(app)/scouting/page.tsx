import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Star, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function getScoutingData() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const reports = await prisma.scoutReport.findMany({
    orderBy: { date: "desc" },
    take: 20,
    include: {
      player: { select: { id: true, firstName: true, lastName: true, primaryPosition: true } },
      scout: { select: { name: true } },
    },
  });

  const totalReports = await prisma.scoutReport.count();
  const recommendations = await prisma.scoutReport.groupBy({
    by: ["recommendation"],
    _count: { id: true },
  });

  return { reports, totalReports, recommendations };
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  SIGN: "bg-green-100 text-green-700",
  MONITOR: "bg-blue-100 text-blue-700",
  TRIAL: "bg-amber-100 text-amber-700",
  FOLLOW_UP: "bg-purple-100 text-purple-700",
  REJECT: "bg-red-100 text-red-700",
};

export default async function ScoutingPage() {
  const { reports, totalReports, recommendations } = await getScoutingData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scouting Reports</h1>
          <p className="text-sm text-muted-foreground">Player evaluations, ratings, and recommendations</p>
        </div>
        <Link href="/scouting/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Report
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold">{totalReports}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        {recommendations.map((r) => (
          <Card key={r.recommendation}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{r.recommendation ?? "Unspecified"}</p>
              <p className="text-3xl font-bold">{r._count.id}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No scouting reports yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start evaluating players to build your scouting database.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/players/${report.player.id}`} className="font-medium hover:underline">
                          {report.player.firstName} {report.player.lastName}
                        </Link>
                        {report.player.primaryPosition && (
                          <Badge variant="outline" className="text-xs">{report.player.primaryPosition}</Badge>
                        )}
                        {report.recommendation && (
                          <Badge className={`text-xs ${RECOMMENDATION_COLORS[report.recommendation] || "bg-gray-100 text-gray-700"}`}>
                            {report.recommendation}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(report.date)}</span>
                        <span>Scout: {report.scout.name}</span>
                        {report.currentLevel && <span>Level: {report.currentLevel}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    {report.overallRating && (
                      <div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">{report.overallRating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Current</p>
                      </div>
                    )}
                    {report.potentialRating && (
                      <div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                          <span className="font-semibold">{report.potentialRating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Potential</p>
                      </div>
                    )}
                  </div>
                </div>
                {report.summary && (
                  <p className="mt-3 text-sm text-muted-foreground border-t pt-3">{report.summary}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
