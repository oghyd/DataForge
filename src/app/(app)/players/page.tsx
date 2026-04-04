import { getPlayers } from "@/services/player-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { POSITIONS, calculateAge } from "@/lib/utils";
import { PlayerFilters } from "@/components/forms/player-filters";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { search?: string; position?: string; status?: string; page?: string };
}) {
  const { players, total, pages } = await getPlayers({
    search: searchParams.search,
    position: searchParams.position,
    status: searchParams.status,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  });

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground">{total} practitioners registered</p>
        </div>
        <Link href="/players/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Player</Button>
        </Link>
      </div>

      <PlayerFilters />

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No players found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchParams.search
                ? "Try adjusting your search or filters"
                : "Get started by adding your first player"}
            </p>
            {!searchParams.search && (
              <Link href="/players/new">
                <Button className="mt-4"><Plus className="mr-2 h-4 w-4" /> Add Player</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Player</th>
                    <th className="p-4 font-medium">Position</th>
                    <th className="p-4 font-medium">Age</th>
                    <th className="p-4 font-medium">Team</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Completeness</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-4">
                        <Link href={`/players/${player.id}`} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{player.firstName} {player.lastName}</p>
                            <p className="text-xs text-muted-foreground">{player.nationality || "—"}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4">
                        {player.primaryPosition ? (
                          <Badge variant="outline">{POSITIONS[player.primaryPosition] || player.primaryPosition}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {calculateAge(player.dateOfBirth) ?? "—"}
                      </td>
                      <td className="p-4 text-sm">
                        {player.currentTeam ? (
                          <span>{player.currentClub?.shortName || player.currentClub?.name || ""} — {player.currentTeam.name}</span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            player.status === "ACTIVE" ? "success" :
                            player.status === "INJURED" ? "destructive" :
                            player.status === "DRAFT" ? "warning" : "secondary"
                          }
                        >
                          {player.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={player.completeness} className="w-16" />
                          <span className="text-xs text-muted-foreground">{player.completeness}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link href={`/players?page=${currentPage - 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`}>
                    <Button variant="outline" size="sm">Previous</Button>
                  </Link>
                )}
                {currentPage < pages && (
                  <Link href={`/players?page=${currentPage + 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`}>
                    <Button variant="outline" size="sm">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
