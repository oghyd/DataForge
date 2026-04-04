"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTrainingSession(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.trainingSession.findUnique({
    where: { id },
    include: {
      team: { include: { club: true } },
      coach: { select: { name: true } },
      attendances: {
        include: {
          player: { select: { id: true, firstName: true, lastName: true, primaryPosition: true } },
        },
        orderBy: { player: { lastName: "asc" } },
      },
    },
  });
}

export async function createTrainingSession(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { teamId, date, startTime, endTime, type, theme, location, intensity, notes } = data as Record<string, string>;

  if (!teamId || !date) return { error: "Team and date are required" };

  const created = await prisma.trainingSession.create({
    data: {
      teamId,
      coachId: session.user.id,
      date: new Date(date),
      startTime: startTime || null,
      endTime: endTime || null,
      type: type || "REGULAR",
      theme: theme || null,
      location: location || null,
      intensity: intensity || null,
      notes: notes || null,
    },
  });

  revalidatePath("/training");
  return { success: true, id: created.id };
}

export async function getTeamsForSelect() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.team.findMany({
    where: { archivedAt: null },
    select: { id: true, name: true, club: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}
