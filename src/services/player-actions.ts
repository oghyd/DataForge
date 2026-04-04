"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { playerCreateSchema, playerUpdateSchema } from "@/validations/player";
import { calculateCompleteness, PLAYER_COMPLETENESS_FIELDS } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getPlayers(params?: {
  search?: string;
  position?: string;
  status?: string;
  teamId?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (params?.search) {
    where.OR = [
      { firstName: { contains: params.search } },
      { lastName: { contains: params.search } },
      { email: { contains: params.search } },
      { city: { contains: params.search } },
    ];
  }
  if (params?.position) where.primaryPosition = params.position;
  if (params?.status) where.status = params.status;

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      where,
      include: {
        teamAssignments: {
          where: { isActive: true },
          include: { team: { include: { club: true } } },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.player.count({ where }),
  ]);

  return {
    players: players.map((p) => ({
      ...p,
      completeness: calculateCompleteness(
        p as unknown as Record<string, unknown>,
        [...PLAYER_COMPLETENESS_FIELDS]
      ),
      currentTeam: p.teamAssignments[0]?.team ?? null,
      currentClub: p.teamAssignments[0]?.team?.club ?? null,
    })),
    total,
    pages: Math.ceil(total / pageSize),
  };
}

export async function getPlayer(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      teamAssignments: {
        include: { team: { include: { club: true } } },
        orderBy: { startDate: "desc" },
      },
      matchStats: {
        include: { match: { include: { homeTeam: true, awayTeam: true } } },
        orderBy: { match: { matchDate: "desc" } },
        take: 20,
      },
      injuryRecords: { orderBy: { injuryDate: "desc" } },
      assessments: { orderBy: { date: "desc" }, take: 5 },
      scoutReports: { orderBy: { date: "desc" }, take: 5 },
      trainingAttendances: {
        include: { trainingSession: true },
        orderBy: { trainingSession: { date: "desc" } },
        take: 20,
      },
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
  });

  if (!player) return null;

  const totalGoals = player.matchStats.reduce((sum, s) => sum + s.goals, 0);
  const totalAssists = player.matchStats.reduce((sum, s) => sum + s.assists, 0);
  const totalMatches = player.matchStats.length;
  const totalMinutes = player.matchStats.reduce((sum, s) => sum + (s.minutesPlayed ?? 0), 0);

  return {
    ...player,
    completeness: calculateCompleteness(
      player as unknown as Record<string, unknown>,
      [...PLAYER_COMPLETENESS_FIELDS]
    ),
    stats: { totalGoals, totalAssists, totalMatches, totalMinutes },
  };
}

export async function createPlayer(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = playerCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const playerData = {
    ...parsed.data,
    dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
    email: parsed.data.email || null,
    guardianEmail: parsed.data.guardianEmail || null,
    photoUrl: parsed.data.photoUrl || null,
    organizationId: session.user.organizationId,
    createdById: session.user.id,
    updatedById: session.user.id,
    dataSource: "MANUAL",
  };

  const player = await prisma.player.create({ data: playerData });

  revalidatePath("/players");
  return { success: true, id: player.id };
}

export async function updatePlayer(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = playerUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const updateData = {
    ...parsed.data,
    dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
    email: parsed.data.email || null,
    guardianEmail: parsed.data.guardianEmail || null,
    photoUrl: parsed.data.photoUrl || null,
    updatedById: session.user.id,
  };

  await prisma.player.update({ where: { id }, data: updateData });

  revalidatePath("/players");
  revalidatePath(`/players/${id}`);
  return { success: true };
}

export async function deletePlayer(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.player.update({
    where: { id },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
  });

  revalidatePath("/players");
  return { success: true };
}
