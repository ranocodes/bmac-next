import { db } from "@/lib/db";

export interface UserRoleInfo {
  personId: string;
  email: string;
  firstName: string;
  lastName: string;
  isMember: boolean;
  isVolunteer: boolean;
  primaryRole: "member" | "volunteer" | "combined" | "none";
}

export async function getUserRole(email: string): Promise<UserRoleInfo | null> {
  const personRows = await db.query<{ id: string; first_name: string; last_name: string; roles: string }>(
    `SELECT id, first_name, last_name, roles::text FROM public.people WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );

  if (!personRows[0]) return null;

  const person = personRows[0];
  let roles: string[] = [];

  try {
    roles = JSON.parse(person.roles || "[]");
  } catch {
    roles = [];
  }

  const isMember = roles.includes("member");
  const isVolunteer = roles.includes("volunteer");

  let primaryRole: "member" | "volunteer" | "combined" | "none" = "none";
  if (isMember && isVolunteer) primaryRole = "combined";
  else if (isMember) primaryRole = "member";
  else if (isVolunteer) primaryRole = "volunteer";

  return {
    personId: person.id,
    email,
    firstName: person.first_name,
    lastName: person.last_name,
    isMember,
    isVolunteer,
    primaryRole,
  };
}
