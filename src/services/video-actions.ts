"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";

export async function getMatchVideos(matchId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.matchVideo.findMany({
    where: { matchId },
    include: { uploadedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllVideos(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const isAdmin = session.user.role === "SUPER_ADMIN";

  // Build where clause: admin sees all, club users see only their org's matches
  const where: Record<string, unknown> = {};
  if (!isAdmin && session.user.organizationId) {
    where.match = { organizationId: session.user.organizationId };
  } else if (!isAdmin) {
    where.uploadedById = session.user.id;
  }

  if (params?.search) {
    where.OR = [
      { title: { contains: params.search } },
      { fileName: { contains: params.search } },
    ];
  }

  const [videos, total] = await Promise.all([
    prisma.matchVideo.findMany({
      where,
      include: {
        match: {
          include: {
            homeTeam: { include: { club: true } },
            awayTeam: { include: { club: true } },
          },
        },
        uploadedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.matchVideo.count({ where }),
  ]);

  return { videos, total, pages: Math.ceil(total / pageSize) };
}

export async function deleteVideo(videoId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const video = await prisma.matchVideo.findUnique({
    where: { id: videoId },
    include: { match: true },
  });

  if (!video) return { error: "Video not found" };

  // Only admin or uploader can delete
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (!isAdmin && video.uploadedById !== session.user.id) {
    return { error: "Not authorized to delete this video" };
  }

  // Delete file from disk
  try {
    const fullPath = join(process.cwd(), "public", video.filePath);
    await unlink(fullPath);
  } catch {
    // File may already be gone
  }

  await prisma.matchVideo.delete({ where: { id: videoId } });

  revalidatePath(`/matches/${video.matchId}`);
  revalidatePath("/videos");
  return { success: true };
}
