"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { matchCreateSchema, teamMatchStatsSchema, playerMatchStatsSchema, matchEventSchema } from "@/validations/match";
import { calculateCompleteness, MATCH_COMPLETENESS_FIELDS } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getMatches(params?: {
  search?: string;
  status?: string;
  teamId?: string;
  competitionId?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (params?.status) where.status = params.status;
  if (params?.teamId) {
    where.OR = [{ homeTeamId: params.teamId }, { awayTeamId: params.teamId }];
  }
  if (params?.competitionId) where.competitionId = params.competitionId;

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      include: {
        homeTeam: { include: { club: true } },
        awayTeam: { include: { club: true } },
        competition: true,
        venue: true,
        season: true,
        _count: { select: { events: true, playerStats: true } },
      },
      orderBy: { matchDate: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.match.count({ where }),
  ]);

  return {
    matches: matches.map((m) => ({
      ...m,
      completeness: calculateCompleteness(
        m as unknown as Record<string, unknown>,
        [...MATCH_COMPLETENESS_FIELDS]
      ),
      eventCount: m._count.events,
      playerStatsCount: m._count.playerStats,
    })),
    total,
    pages: Math.ceil(total / pageSize),
  };
}

export async function getMatch(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: { include: { club: true } },
      awayTeam: { include: { club: true } },
      competition: true,
      venue: true,
      season: true,
      teamStats: true,
      playerStats: {
        include: { player: true },
        orderBy: [{ starter: "desc" }, { minutesPlayed: "desc" }],
      },
      events: {
        include: { player: true },
        orderBy: [{ minute: "asc" }, { addedTime: "asc" }],
      },
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
  });

  if (!match) return null;

  const homeStats = match.teamStats.find((s) => s.side === "HOME");
  const awayStats = match.teamStats.find((s) => s.side === "AWAY");
  const homePlayerStats = match.playerStats.filter((s) => s.teamId === match.homeTeamId);
  const awayPlayerStats = match.playerStats.filter((s) => s.teamId === match.awayTeamId);

  return {
    ...match,
    homeStats,
    awayStats,
    homePlayerStats,
    awayPlayerStats,
    completeness: calculateCompleteness(
      match as unknown as Record<string, unknown>,
      [...MATCH_COMPLETENESS_FIELDS]
    ),
  };
}

export async function createMatch(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = matchCreateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return { error: "Home and away team cannot be the same" };
  }

  const match = await prisma.match.create({
    data: {
      ...parsed.data,
      matchDate: new Date(parsed.data.matchDate),
      organizationId: session.user.organizationId,
      createdById: session.user.id,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/matches");
  return { success: true, id: match.id };
}

export async function updateMatch(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = matchCreateSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const updateData: Record<string, unknown> = { ...parsed.data, updatedById: session.user.id };
  if (parsed.data.matchDate) {
    updateData.matchDate = new Date(parsed.data.matchDate);
  }

  await prisma.match.update({ where: { id }, data: updateData });

  revalidatePath("/matches");
  revalidatePath(`/matches/${id}`);
  return { success: true };
}

export async function saveTeamMatchStats(matchId: string, teamId: string, side: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = teamMatchStatsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.teamMatchStats.upsert({
    where: { matchId_teamId: { matchId, teamId } },
    create: { matchId, teamId, side, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

export async function savePlayerMatchStats(matchId: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = playerMatchStatsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.playerMatchStats.upsert({
    where: { matchId_playerId: { matchId, playerId: parsed.data.playerId } },
    create: { matchId, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

export async function createMatchEvent(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = matchEventSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.matchEvent.create({ data: parsed.data });

  revalidatePath(`/matches/${parsed.data.matchId}`);
  return { success: true };
}

export async function getSeasons() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function getCompetitions(seasonId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.competition.findMany({
    where: seasonId ? { seasonId } : {},
    orderBy: { name: "asc" },
  });
}

export async function getVenues() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.venue.findMany({ orderBy: { name: "asc" } });
}
