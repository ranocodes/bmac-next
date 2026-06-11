"use server";

import { auth } from "@clerk/nextjs/server";

export async function signOut() {
  return { success: true };
}
