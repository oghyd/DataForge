"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function searchAll(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [players, teams, clubs, matches] = await Promise.all([
    prisma.player.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { city: { contains: query } },
          { nationality: { contains: query } },
          { primaryPosition: { contains: query } },
        ],
      },
      select: {
        id: true, firstName: true, lastName: true, primaryPosition: true,
        status: true, city: true, nationality: true,
      },
      take: 10,
    }),
    prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { club: { name: { contains: query } } },
        ],
      },
      select: {
        id: true, name: true, ageGroup: true, gender: true, formation: true,
        club: { select: { name: true } },
      },
      take: 10,
    }),
    prisma.club.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { shortName: { contains: query } },
          { city: { contains: query } },
        ],
      },
      select: {
        id: true, name: true, shortName: true, city: true, primaryColor: true,
      },
      take: 10,
    }),
    prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { club: { name: { contains: query } } } },
          { awayTeam: { club: { name: { contains: query } } } },
          { refereeName: { contains: query } },
        ],
      },
      select: {
        id: true, matchDate: true, status: true, homeScore: true, awayScore: true,
        homeTeam: { select: { club: { select: { name: true } } } },
        awayTeam: { select: { club: { select: { name: true } } } },
      },
      take: 10,
    }),
  ]);

  return { players, teams, clubs, matches };
}
