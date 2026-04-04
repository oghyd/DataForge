import { getMatches } from "@/services/match-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Swords } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const { matches, total, pages } = await getMatches({
    status: searchParams.status,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  });

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-muted-foreground">{total} matches recorded</p>
        </div>
        <Link href="/matches/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Record Match</Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: "All", value: "" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Postponed", value: "POSTPONED" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/matches${tab.value ? `?status=${tab.value}` : ""}`}
          >
            <Button
              variant={searchParams.status === tab.value || (!searchParams.status && !tab.value) ? "default" : "outline"}
              size="sm"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Swords className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No matches found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Start by recording your first match</p>
            <Link href="/matches/new">
              <Button className="mt-4"><Plus className="mr-2 h-4 w-4" /> Record Match</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-6 py-4">
                  {/* Teams and Score */}
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex-1 text-right">
                      <p className="font-semibold">{match.homeTeam.club?.shortName || match.homeTeam.name}</p>
                      <p className="text-xs text-muted-foreground">{match.homeTeam.name}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 min-w-[80px] justify-center">
                      {match.homeScore !== null ? (
                        <span className="text-xl font-bold">{match.homeScore} - {match.awayScore}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">vs</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{match.awayTeam.club?.shortName || match.awayTeam.name}</p>
                      <p className="text-xs text-muted-foreground">{match.awayTeam.name}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">{formatDate(match.matchDate)}</p>
                      {match.competition && (
                        <p className="text-xs text-muted-foreground">{match.competition.name}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        match.status === "COMPLETED" ? "success" :
                        match.status === "SCHEDULED" ? "info" :
                        match.status === "POSTPONED" ? "warning" : "secondary"
                      }
                    >
                      {match.status}
                    </Badge>
                    <div className="w-20">
                      <div className="flex items-center gap-1">
                        <Progress value={match.completeness} className="flex-1" />
                        <span className="text-[10px] text-muted-foreground">{match.completeness}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link href={`/matches?page=${currentPage - 1}${searchParams.status ? `&status=${searchParams.status}` : ""}`}>
                    <Button variant="outline" size="sm">Previous</Button>
                  </Link>
                )}
                {currentPage < pages && (
                  <Link href={`/matches?page=${currentPage + 1}${searchParams.status ? `&status=${searchParams.status}` : ""}`}>
                    <Button variant="outline" size="sm">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
