import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Shield, MapPin, Plus } from "lucide-react";
import Link from "next/link";

async function getOrganizationData() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const organizations = await prisma.organization.findMany({
    where: { archivedAt: null },
    include: {
      _count: { select: { clubs: true, members: true, seasons: true, competitions: true } },
      clubs: {
        where: { archivedAt: null },
        include: {
          _count: { select: { teams: true } },
        },
      },
    },
  });

  return organizations;
}

const TYPE_COLORS: Record<string, string> = {
  FEDERATION: "bg-purple-100 text-purple-700",
  LEAGUE: "bg-blue-100 text-blue-700",
  ACADEMY: "bg-green-100 text-green-700",
  CLUB: "bg-amber-100 text-amber-700",
  SCHOOL: "bg-cyan-100 text-cyan-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default async function OrganizationsPage() {
  const organizations = await getOrganizationData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-muted-foreground">Manage clubs, academies, leagues, and their structure</p>
        </div>
        <Link href="/organizations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Organization
          </Button>
        </Link>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No organizations yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Register to create your first organization.</p>
          </CardContent>
        </Card>
      ) : (
        organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{org.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={TYPE_COLORS[org.type] || TYPE_COLORS.OTHER}>{org.type}</Badge>
                      {org.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {org.city}{org.region ? `, ${org.region}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold">{org._count.clubs}</p>
                    <p className="text-xs text-muted-foreground">Clubs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{org._count.members}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{org._count.competitions}</p>
                    <p className="text-xs text-muted-foreground">Competitions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{org._count.seasons}</p>
                    <p className="text-xs text-muted-foreground">Seasons</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            {org.clubs.length > 0 && (
              <CardContent>
                <p className="text-sm font-medium mb-3">Clubs</p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {org.clubs.map((club) => (
                    <div key={club.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: club.primaryColor || "#6b7280" }}
                      >
                        {club.shortName || club.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{club.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" /> {club._count.teams} teams
                          </span>
                          {club.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {club.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
            {org.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{org.description}</p>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
