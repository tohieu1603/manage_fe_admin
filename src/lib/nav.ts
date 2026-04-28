// Nav config for AppShell — computes role-specific menu, with badges
// resolved against live BE data (jobs queue / dispatch unassigned / tech
// own queue, etc).

import { api, type BeJob } from "./api";
import { ROLES, type RoleKey } from "./roles";

interface NavCounts {
  pendingJobs: number; // status=new (chưa assign) — dispatcher dispatch hot
  totalJobs: number; // for "Công việc" badge
  myJobs: number; // jobs of this technician
}

async function fetchCounts(role: RoleKey, userId: string): Promise<NavCounts> {
  // Count jobs by status using BE list `meta.total` — cheap (no payload).
  // For technician queue, filter by their tech.id (lookup once).
  const [allRes, newRes] = await Promise.all([
    api.list<BeJob[]>("/jobs?limit=1"),
    api.list<BeJob[]>("/jobs?status=new&limit=1"),
  ]);

  let myJobs = 0;
  if (role === "technician") {
    // Find this user's technician row, then count their open jobs.
    try {
      const techs = await api.get<{ id: string; userId: string }[]>("/technicians/active");
      const me = techs.find((t) => t.userId === userId);
      if (me) {
        const mine = await api.list<BeJob[]>(`/jobs?technicianId=${me.id}&limit=1`);
        myJobs = mine.meta?.total ?? 0;
      }
    } catch {
      // ignore — badge falls back to 0
    }
  }

  return {
    pendingJobs: newRes.meta?.total ?? 0,
    totalJobs: allRes.meta?.total ?? 0,
    myJobs,
  };
}

// Returns a deep-cloned ROLES[role] with badges filled in from BE.
export async function buildNav(role: RoleKey, userId: string) {
  const counts = await fetchCounts(role, userId).catch(() => ({
    pendingJobs: 0,
    totalJobs: 0,
    myJobs: 0,
  }));

  const r = ROLES[role];
  const nav = r.nav.map((g) => ({
    group: g.group,
    items: g.items.map((it) => {
      let badge: string | undefined;
      let hot: boolean | undefined;
      // Per-role badge rules — keeps view-specific, business-meaningful.
      if (it.id === "jobs") badge = String(counts.totalJobs || "");
      if (role === "technician" && it.id === "jobs") badge = String(counts.myJobs || "");
      if (role === "dispatcher" && it.id === "dispatch") {
        if (counts.pendingJobs > 0) {
          badge = String(counts.pendingJobs);
          hot = true;
        }
      }
      if (role === "cskh" && it.id === "jobs") badge = String(counts.totalJobs || "");
      return badge ? { ...it, badge, ...(hot !== undefined && { hot }) } : { ...it, badge: undefined, hot: undefined };
    }),
  }));

  return nav;
}
