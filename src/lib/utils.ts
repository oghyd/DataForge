import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateAge(dateOfBirth: Date | string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function calculateCompleteness(obj: Record<string, unknown>, fields: string[]): number {
  if (fields.length === 0) return 100;
  const filled = fields.filter((f) => {
    const val = obj[f];
    return val !== null && val !== undefined && val !== "";
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PLAYER_COMPLETENESS_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "nationality",
  "email",
  "phone",
  "preferredFoot",
  "primaryPosition",
  "height",
  "weight",
  "photoUrl",
  "city",
  "country",
] as const;

export const MATCH_COMPLETENESS_FIELDS = [
  "homeScore",
  "awayScore",
  "homeHalfTimeScore",
  "awayHalfTimeScore",
  "venueId",
  "competitionId",
  "refereeName",
  "weather",
  "attendance",
] as const;

export const POSITIONS: Record<string, string> = {
  GK: "Goalkeeper",
  CB: "Center Back",
  LB: "Left Back",
  RB: "Right Back",
  CDM: "Defensive Midfielder",
  CM: "Central Midfielder",
  CAM: "Attacking Midfielder",
  LM: "Left Midfielder",
  RM: "Right Midfielder",
  LW: "Left Wing",
  RW: "Right Wing",
  CF: "Center Forward",
  ST: "Striker",
};

export const AGE_GROUPS = [
  "U6", "U8", "U10", "U12", "U14", "U16", "U18", "U20", "U23", "SENIOR", "VETERAN",
] as const;

export const PLAYER_STATUSES = [
  "ACTIVE", "INACTIVE", "INJURED", "SUSPENDED", "TRANSFERRED", "RETIRED", "ARCHIVED", "DRAFT",
] as const;

export const MATCH_STATUSES = [
  "SCHEDULED", "IN_PROGRESS", "COMPLETED", "POSTPONED", "CANCELLED", "ABANDONED",
] as const;
