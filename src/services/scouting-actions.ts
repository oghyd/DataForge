"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createScoutReport(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const d = data as Record<string, string>;

  if (!d.playerId) return { error: "Player is required" };

  const report = await prisma.scoutReport.create({
    data: {
      playerId: d.playerId,
      scoutId: session.user.id,
      overallRating: d.overallRating ? parseFloat(d.overallRating) : null,
      potentialRating: d.potentialRating ? parseFloat(d.potentialRating) : null,
      currentLevel: d.currentLevel || null,
      recommendedLevel: d.recommendedLevel || null,
      strengths: d.strengths || null,
      weaknesses: d.weaknesses || null,
      summary: d.summary || null,
      recommendation: d.recommendation || null,
      tags: d.tags || null,
    },
  });

  revalidatePath("/scouting");
  return { success: true, id: report.id };
}

export async function getPlayersForSelect() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.player.findMany({
    where: { archivedAt: null },
    select: { id: true, firstName: true, lastName: true, primaryPosition: true },
    orderBy: { lastName: "asc" },
  });
}
