import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const matchId = formData.get("matchId") as string | null;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;

  if (!file || !matchId) {
    return NextResponse.json({ error: "File and matchId are required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only MP4, WebM, and QuickTime videos are allowed" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
  }

  // Verify match exists
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Save file
  const ext = file.name.split(".").pop() || "mp4";
  const fileName = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "videos");
  const filePath = join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Save record
  const video = await prisma.matchVideo.create({
    data: {
      matchId,
      uploadedById: session.user.id,
      fileName: file.name,
      filePath: `/uploads/videos/${fileName}`,
      fileSize: file.size,
      mimeType: file.type,
      title: title || file.name,
      description,
    },
  });

  return NextResponse.json({ success: true, video });
}
