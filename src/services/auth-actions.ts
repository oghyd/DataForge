"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  organizationType: string;
}) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "ORG_ADMIN",
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: parsed.data.organizationName,
      type: parsed.data.organizationType,
      createdById: user.id,
    },
  });

  await prisma.userOrganization.create({
    data: {
      userId: user.id,
      organizationId: organization.id,
      role: "ADMIN",
    },
  });

  // Create a default season
  const currentYear = new Date().getFullYear();
  await prisma.season.create({
    data: {
      organizationId: organization.id,
      name: `${currentYear}-${currentYear + 1}`,
      startDate: new Date(`${currentYear}-08-01`),
      endDate: new Date(`${currentYear + 1}-06-30`),
      isCurrent: true,
    },
  });

  return { success: true };
}
