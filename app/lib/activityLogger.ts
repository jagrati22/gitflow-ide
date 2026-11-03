export interface ActivityItem {
  id: string;
  type: "refactor" | "commit" | "connect";
  repo: string;
  file?: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
  sha?: string;
}

const STORAGE_KEY = "gitflow_live_activities";

export function getActivities(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logActivity(item: Omit<ActivityItem, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const current = getActivities();
    const newEntry: ActivityItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50 activities
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}