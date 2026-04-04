import { getTrainingSession } from "@/services/training-actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users, Star } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function TrainingDetailPage({ params }: { params: { id: string } }) {
  const session = await getTrainingSession(params.id);
  if (!session) return notFound();

  const present = session.attendances.filter((a) => a.status === "PRESENT");
  const absent = session.attendances.filter((a) => a.status === "ABSENT");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/training">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{session.theme || "Training Session"}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(session.date)}</span>
            {session.startTime && session.endTime && (
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {session.startTime} - {session.endTime}</span>
            )}
            <span>{session.team.club.name} — {session.team.name}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{session.attendances.length}</p>
            <p className="text-xs text-muted-foreground">Total Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{present.length}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-600">{absent.length}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {session.attendances.length > 0 ? Math.round((present.length / session.attendances.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline">{session.type}</Badge>
        {session.intensity && (
          <Badge className={session.intensity === "HIGH" ? "bg-red-100 text-red-700" : session.intensity === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>
            {session.intensity} intensity
          </Badge>
        )}
        {session.coach && <span className="text-sm text-muted-foreground">Coach: {session.coach.name}</span>}
        {session.location && <span className="text-sm text-muted-foreground">@ {session.location}</span>}
      </div>

      {session.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{session.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Attendance ({session.attendances.length} players)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {session.attendances.map((att) => (
              <div key={att.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {att.player.firstName[0]}{att.player.lastName[0]}
                  </div>
                  <div>
                    <Link href={`/players/${att.player.id}`} className="text-sm font-medium hover:underline">
                      {att.player.firstName} {att.player.lastName}
                    </Link>
                    {att.player.primaryPosition && (
                      <span className="ml-2 text-xs text-muted-foreground">{att.player.primaryPosition}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {att.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{att.rating}</span>
                    </div>
                  )}
                  <Badge className={
                    att.status === "PRESENT" ? "bg-green-100 text-green-700" :
                    att.status === "ABSENT" ? "bg-red-100 text-red-700" :
                    att.status === "LATE" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }>
                    {att.status}
                  </Badge>
                </div>
              </div>
            ))}
            {session.attendances.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No attendance recorded for this session.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
