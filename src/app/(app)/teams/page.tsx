import { getTeams } from "@/services/team-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Users, Swords } from "lucide-react";
import Link from "next/link";


export default async function TeamsPage({
  searchParams,
}: {
  searchParams: { search?: string; ageGroup?: string };
}) {
  const teams = await getTeams({
    search: searchParams.search,
    ageGroup: searchParams.ageGroup,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">{teams.length} teams registered</p>
        </div>
        <Link href="/teams/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Team</Button>
        </Link>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create a club first, then add teams</p>
            <Link href="/teams/new">
              <Button className="mt-4"><Plus className="mr-2 h-4 w-4" /> Add Team</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.club.name}</p>
                      </div>
                    </div>
                    {team.ageGroup && <Badge variant="outline">{team.ageGroup}</Badge>}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{team.playerCount} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5" />
                      <span>{team.matchCount} matches</span>
                    </div>
                    {team.gender && (
                      <Badge variant="secondary" className="text-[10px]">{team.gender}</Badge>
                    )}
                  </div>
                  {team.season && (
                    <p className="mt-2 text-xs text-muted-foreground">Season: {team.season.name}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
