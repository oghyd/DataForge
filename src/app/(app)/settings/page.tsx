import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Database, Calendar } from "lucide-react";

async function getSettingsData() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, name: true, role: true, phone: true, isActive: true,
      createdAt: true, lastLoginAt: true,
      organizationMemberships: {
        include: {
          organization: {
            select: { id: true, name: true, type: true, city: true },
          },
        },
      },
    },
  });

  const dbStats = await Promise.all([
    prisma.player.count(),
    prisma.team.count(),
    prisma.match.count(),
    prisma.club.count(),
    prisma.trainingSession.count(),
    prisma.scoutReport.count(),
  ]);

  const currentSeason = await prisma.season.findFirst({
    where: { isCurrent: true },
    select: { name: true, startDate: true, endDate: true },
  });

  return { user, dbStats, currentSeason };
}

export default async function SettingsPage() {
  const { user, dbStats, currentSeason } = await getSettingsData();
  const [players, teams, matches, clubs, trainingSessions, scoutReports] = dbStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Account, organization, and platform configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge variant="outline">{user?.role}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className={user?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {user?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last login</p>
                <p className="text-sm">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.organizationMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No organization memberships</p>
            ) : (
              <div className="space-y-3">
                {user?.organizationMemberships.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{m.organization.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.organization.type} {m.organization.city ? `· ${m.organization.city}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline">{m.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Current Season
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSeason ? (
              <div>
                <p className="text-lg font-semibold">{currentSeason.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentSeason.startDate).toLocaleDateString()} — {new Date(currentSeason.endDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active season configured</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" /> Database Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Players", count: players },
                { label: "Teams", count: teams },
                { label: "Matches", count: matches },
                { label: "Clubs", count: clubs },
                { label: "Training", count: trainingSessions },
                { label: "Scout Reports", count: scoutReports },
              ].map((item) => (
                <div key={item.label} className="text-center rounded-lg bg-muted/50 p-3">
                  <p className="text-xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
