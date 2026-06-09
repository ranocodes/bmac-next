import { getAll, setItem } from "@/data/store";

const MAX_LOGS = 1000;
const KEY = "activity_logs";

export function logActivity(user: string, action: string, resource: string, resourceId?: string, details?: string) {
  if (typeof window === "undefined") return;
  const logs = getAll<any>(KEY);
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user,
    action,
    resource,
    resourceId,
    details,
    timestamp: Date.now(),
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
  setItem(KEY, logs);
}
