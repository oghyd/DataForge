import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Calendar, Clock, Users, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function getTrainingData() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const sessions = await prisma.trainingSession.findMany({
    orderBy: { date: "desc" },
    take: 20,
    include: {
      team: { include: { club: true } },
      coach: { select: { name: true } },
      _count: { select: { attendances: true } },
      attendances: {
        select: { status: true },
      },
    },
  });

  const totalSessions = await prisma.trainingSession.count();
  const totalAttendances = await prisma.trainingAttendance.count();
  const presentCount = await prisma.trainingAttendance.count({ where: { status: "PRESENT" } });
  const avgAttendance = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

  return { sessions, totalSessions, avgAttendance };
}

export default async function TrainingPage() {
  const { sessions, totalSessions, avgAttendance } = await getTrainingData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Training Sessions</h1>
          <p className="text-sm text-muted-foreground">Track sessions, attendance, and performance</p>
        </div>
        <Link href="/training/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Session
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{totalSessions}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold">{avgAttendance}%</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">
                  {sessions.filter((s) => {
                    const now = new Date();
                    return s.date.getMonth() === now.getMonth() && s.date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No training sessions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first training session to start tracking attendance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const present = session.attendances.filter((a) => a.status === "PRESENT").length;
            const total = session._count.attendances;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <Link key={session.id} href={`/training/${session.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.theme || "Training Session"}</p>
                            <Badge variant="outline" className="text-xs">{session.type}</Badge>
                            {session.intensity && (
                              <Badge
                                className={`text-xs ${
                                  session.intensity === "HIGH" ? "bg-red-100 text-red-700" :
                                  session.intensity === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                                  "bg-green-100 text-green-700"
                                }`}
                              >
                                {session.intensity}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(session.date)}
                            </span>
                            {session.startTime && session.endTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {session.startTime} - {session.endTime}
                              </span>
                            )}
                            <span>{session.team.club.name} — {session.team.name}</span>
                            {session.coach && <span>Coach: {session.coach.name}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{present}/{total} present</p>
                        <p className="text-xs text-muted-foreground">{rate}% attendance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
