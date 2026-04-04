"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const teamCreateSchema = z.object({
  clubId: z.string().min(1, "Club is required"),
  name: z.string().min(1, "Team name is required").max(200),
  ageGroup: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "MIXED"]).default("MALE"),
  level: z.string().optional().nullable(),
  seasonId: z.string().optional().nullable(),
  formation: z.string().optional().nullable(),
});

export async function getTeams(params?: { search?: string; clubId?: string; ageGroup?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = { archivedAt: null };
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { club: { name: { contains: params.search } } },
    ];
  }
  if (params?.clubId) where.clubId = params.clubId;
  if (params?.ageGroup) where.ageGroup = params.ageGroup;

  const teams = await prisma.team.findMany({
    where,
    include: {
      club: true,
      season: true,
      _count: {
        select: {
          playerAssignments: { where: { isActive: true } },
          homeMatches: true,
          awayMatches: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return teams.map((t) => ({
    ...t,
    playerCount: t._count.playerAssignments,
    matchCount: t._count.homeMatches + t._count.awayMatches,
  }));
}

export async function getTeam(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.team.findUnique({
    where: { id },
    include: {
      club: true,
      season: true,
      playerAssignments: {
        where: { isActive: true },
        include: { player: true },
        orderBy: { jerseyNumber: "asc" },
      },
      homeMatches: {
        include: { awayTeam: true, homeClub: true, awayClub: true },
        orderBy: { matchDate: "desc" },
        take: 10,
      },
      awayMatches: {
        include: { homeTeam: true, homeClub: true, awayClub: true },
        orderBy: { matchDate: "desc" },
        take: 10,
      },
      trainingSessions: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });
}

export async function createTeam(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = teamCreateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const team = await prisma.team.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  revalidatePath("/teams");
  return { success: true, id: team.id };
}

export async function updateTeam(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = teamCreateSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.team.update({ where: { id }, data: parsed.data });

  revalidatePath("/teams");
  revalidatePath(`/teams/${id}`);
  return { success: true };
}

export async function addPlayerToTeam(teamId: string, playerId: string, jerseyNumber?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.playerTeamAssignment.create({
    data: { teamId, playerId, jerseyNumber, isActive: true },
  });

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function getClubs() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.club.findMany({
    where: { archivedAt: null },
    include: { _count: { select: { teams: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createClub(data: { name: string; shortName?: string; city?: string; organizationId: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const club = await prisma.club.create({
    data: {
      ...data,
      createdById: session.user.id,
    },
  });

  revalidatePath("/teams");
  revalidatePath("/organizations");
  return { success: true, id: club.id };
}
