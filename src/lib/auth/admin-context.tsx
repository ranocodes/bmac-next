"use client";

import { createContext, useContext } from "react";
import type { Permission } from "@/types/cms";

export interface AdminUserContextValue {
  email: string;
  firstName: string;
  role: string;
  permissions: Permission[];
}

const AdminContext = createContext<AdminUserContextValue | null>(null);

export const AdminProvider = AdminContext.Provider;
export const AdminConsumer = AdminContext.Consumer;

export function useAdmin(): AdminUserContextValue | null {
  return useContext(AdminContext);
}
