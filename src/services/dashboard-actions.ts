"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [
    totalPlayers,
    activePlayers,
    totalTeams,
    totalMatches,
    completedMatches,
    totalClubs,
    recentPlayers,
    recentMatches,
    positionDistribution,
    playersByStatus,
    monthlyGrowth,
  ] = await Promise.all([
    prisma.player.count(),
    prisma.player.count({ where: { status: "ACTIVE" } }),
    prisma.team.count({ where: { archivedAt: null } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.club.count({ where: { archivedAt: null } }),
    prisma.player.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, primaryPosition: true, createdAt: true, status: true },
    }),
    prisma.match.findMany({
      orderBy: { matchDate: "desc" },
      take: 5,
      include: {
        homeTeam: { include: { club: true } },
        awayTeam: { include: { club: true } },
      },
    }),
    prisma.player.groupBy({
      by: ["primaryPosition"],
      _count: { id: true },
      where: { primaryPosition: { not: null }, status: "ACTIVE" },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.player.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    getMonthlyPlayerGrowth(),
  ]);

  // Calculate data completeness across all players
  const allPlayers = await prisma.player.findMany({
    select: {
      firstName: true, lastName: true, dateOfBirth: true, gender: true,
      nationality: true, email: true, phone: true, preferredFoot: true,
      primaryPosition: true, height: true, weight: true, photoUrl: true,
      city: true, country: true,
    },
  });

  const fields = [
    "firstName", "lastName", "dateOfBirth", "gender", "nationality",
    "email", "phone", "preferredFoot", "primaryPosition", "height",
    "weight", "photoUrl", "city", "country",
  ];

  let totalFields = 0;
  let filledFields = 0;
  for (const p of allPlayers) {
    for (const f of fields) {
      totalFields++;
      const val = (p as Record<string, unknown>)[f];
      if (val !== null && val !== undefined && val !== "") filledFields++;
    }
  }
  const overallCompleteness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return {
    totalPlayers,
    activePlayers,
    totalTeams,
    totalMatches,
    completedMatches,
    totalClubs,
    overallCompleteness,
    recentPlayers,
    recentMatches,
    positionDistribution: positionDistribution.map((p) => ({
      position: p.primaryPosition ?? "Unknown",
      count: p._count.id,
    })),
    playersByStatus: playersByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    monthlyGrowth,
  };
}

async function getMonthlyPlayerGrowth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const players = await prisma.player.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const months: Record<string, number> = {};
  for (const p of players) {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    months[key] = (months[key] || 0) + 1;
  }

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}
