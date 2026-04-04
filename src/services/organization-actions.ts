"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createOrganization(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const d = data as Record<string, string>;

  if (!d.name) return { error: "Organization name is required" };

  const org = await prisma.organization.create({
    data: {
      name: d.name,
      type: d.type || "CLUB",
      description: d.description || null,
      city: d.city || null,
      region: d.region || null,
      country: d.country || "MA",
      email: d.email || null,
      phone: d.phone || null,
      website: d.website || null,
      createdById: session.user.id,
    },
  });

  await prisma.userOrganization.create({
    data: { userId: session.user.id, organizationId: org.id, role: "ADMIN" },
  });

  revalidatePath("/organizations");
  return { success: true, id: org.id };
}
