// Drop-in adapter that mimics the subset of the Prisma client surface the
// pages use (prisma.{job|technician|customer|part}.{findMany|findUnique}),
// backed by the CoolOps BE. Pages stay untouched — responses are transformed
// to the shape the original Prisma schema exposed.

import { api, BeCustomer, BeJob, BeJobEvent, BePart, BeTechnician } from "./api";

// === Status / type mapping between BE and the UI's Prisma-era shape ===
const jobStatusMap: Record<string, string> = {
  new: "pending",
  assigned: "pending",
  paused: "pending",
  en_route: "traveling",
  onsite: "in_progress",
  in_progress: "in_progress",
  completed: "done",
  cancelled: "cancelled",
};

const customerTypeMap: Record<string, string> = {
  company: "Doanh nghiệp",
  individual: "Cá nhân",
};

const jobTypeMap: Record<string, string> = {
  install: "Lắp đặt",
  repair: "Sửa chữa",
  maintenance: "Bảo dưỡng",
  uninstall: "Tháo dỡ",
  gas_charge: "Nạp gas",
};

// Seeded palette → map by tech id order so colors remain stable.
const techColors = ["brand", "violet", "ok", "warn", "pink", "teal", "amber", "rose"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[parts.length - 1]?.[0] ?? "") + (parts[0]?.[0] ?? "")).toUpperCase();
}

// === Adapters ===
function adaptTech(t: BeTechnician, idx = 0) {
  const name = t.user?.name ?? "";
  return {
    id: t.id,
    name,
    skill: t.skill ?? "",
    rating: Number(t.rating ?? 0),
    jobsMonth: t.jobsMonth ?? 0,
    status: t.status,
    // Friendly area label instead of raw coords. If we ever wire reverse-
    // geocoding, replace this with the resolved district/ward.
    location: t.lat && t.lng ? "Khu vực Hà Nội" : "Chưa cập nhật vị trí",
    eta: "—",
    color: techColors[idx % techColors.length],
    initials: initialsOf(name),
    phone: t.user?.phone ?? "",
  };
}

function adaptEvent(e: BeJobEvent) {
  return {
    id: e.id,
    jobId: e.jobId,
    time: new Date(e.createdAt).toLocaleString("vi-VN"),
    actor: e.actor?.name ?? "Hệ thống",
    action: e.action,
    detail: e.detail ?? "",
    order: 0,
  };
}

// Formats an ISO date to the "YYYY-MM-DD HH:MM" shape the original Prisma
// schema stored as String (so timeOf/dateOf helpers keep working).
function fmtDateStr(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function adaptJob(j: BeJob, techIndex: Map<string, number> = new Map()) {
  const techIdx = j.technician ? techIndex.get(j.technician.id) ?? 0 : 0;
  return {
    id: j.id,
    code: j.code,
    title: j.title,
    type: jobTypeMap[j.type] ?? j.type,
    priority: j.priority,
    // UI status (mapped to original Prisma vocabulary).
    status: jobStatusMap[j.status] ?? j.status,
    // Raw BE status — needed by actions to call the BE state machine
    // without losing transitions inside the same Prisma alias bucket
    // (e.g. new vs assigned both map to "pending").
    beStatus: j.status,
    amount: Number(j.amount ?? 0),
    scheduledAt: fmtDateStr(j.scheduledAt),
    startedAt: fmtDateStr(j.startedAt),
    completedAt: fmtDateStr(j.completedAt),
    // Format minutes back to "Xh Y" string the dispatch grid parses.
    duration: (() => {
      const m = j.durationMin ?? 60;
      const h = Math.floor(m / 60);
      const r = m % 60;
      return r ? `${h}h ${r}` : `${h}h`;
    })(),
    notes: j.notes ?? "",
    technicianId: j.technician?.id ?? null,
    customerId: j.customer?.id ?? null,
    // Original Prisma stored job.address as a denormalized snapshot of the
    // customer's address — keep that contract by deriving from the relation.
    address: j.customer?.address ?? "",
    customer: j.customer ? adaptCustomer(j.customer) : null,
    technician: j.technician ? adaptTech(j.technician, techIdx) : null,
    events: j.events?.map(adaptEvent) ?? [],
    createdAt: new Date(),
  };
}

function adaptCustomer(c: BeCustomer, jobs: ReturnType<typeof adaptJob>[] = []) {
  return {
    id: c.id,
    name: c.name,
    type: customerTypeMap[c.type] ?? c.type,
    address: c.address,
    phone: c.phone ?? "",
    units: c.devices?.length ?? 0,
    since: c.createdAt ? String(new Date(c.createdAt).getFullYear()) : "—",
    jobs,
    devices:
      c.devices?.map((d) => ({
        id: d.id,
        name: d.name,
        room: d.room ?? "—",
        lastService: d.lastServiceAt ? new Date(d.lastServiceAt).toLocaleDateString("vi-VN") : "—",
        warranty: d.warrantyUntil ?? "—",
      })) ?? [],
  };
}

function adaptPart(p: BePart) {
  return {
    id: p.id,
    name: p.name,
    stock: p.stockQty,
    min: p.minStock,
    price: Number(p.unitPrice ?? 0),
    unit: p.unit,
  };
}

// === Prisma-shaped proxy ===
interface FindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  take?: number;
}

interface FindUniqueArgs {
  where: { id: string };
  include?: Record<string, unknown>;
}

async function fetchTechIndex(): Promise<Map<string, number>> {
  const techs = await api.get<BeTechnician[]>("/technicians/active");
  const m = new Map<string, number>();
  techs.forEach((t, i) => m.set(t.id, i));
  return m;
}

// Extra args beyond Prisma's surface — pages calling pagination/search use
// these directly. Kept separate so existing `findMany` callers don't have to
// change.
export interface PaginatedArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  technicianId?: string;
  customerId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const db = {
  job: {
    async findMany(args: FindManyArgs = {}) {
      const qs = new URLSearchParams({ limit: String(Math.min(args.take ?? 100, 100)) });
      if (args.where?.technicianId) qs.set("technicianId", String(args.where.technicianId));
      if (args.where?.customerId) qs.set("customerId", String(args.where.customerId));
      const [wrap, techIdx] = await Promise.all([
        api.list<BeJob[]>(`/jobs?${qs}`),
        fetchTechIndex(),
      ]);
      return wrap.data.map((j) => adaptJob(j, techIdx));
    },
    // Returns BE-paginated rows + meta so pages can render server-side
    // pagination and pass the meta into the <Pagination> component.
    async findPaginated(args: PaginatedArgs = {}): Promise<PaginatedResult<ReturnType<typeof adaptJob>>> {
      const qs = new URLSearchParams();
      qs.set("page", String(args.page ?? 1));
      qs.set("limit", String(Math.min(args.limit ?? 20, 100)));
      if (args.search) qs.set("search", args.search);
      if (args.status) qs.set("status", args.status);
      if (args.technicianId) qs.set("technicianId", args.technicianId);
      if (args.customerId) qs.set("customerId", args.customerId);
      const [wrap, techIdx] = await Promise.all([
        api.list<BeJob[]>(`/jobs?${qs}`),
        fetchTechIndex(),
      ]);
      return {
        data: wrap.data.map((j) => adaptJob(j, techIdx)),
        page: wrap.meta?.page ?? 1,
        limit: wrap.meta?.limit ?? 20,
        total: wrap.meta?.total ?? wrap.data.length,
        totalPages: wrap.meta?.totalPages ?? 1,
      };
    },
    async findUnique(args: FindUniqueArgs) {
      try {
        const [j, techIdx] = await Promise.all([
          api.get<BeJob>(`/jobs/${args.where.id}`),
          fetchTechIndex(),
        ]);
        return adaptJob(j, techIdx);
      } catch {
        return null;
      }
    },
  },
  technician: {
    async findMany() {
      const techs = await api.get<BeTechnician[]>("/technicians/active");
      return techs.map((t, i) => adaptTech(t, i));
    },
  },
  customer: {
    async findPaginated(args: PaginatedArgs = {}): Promise<PaginatedResult<ReturnType<typeof adaptCustomer>>> {
      const qs = new URLSearchParams();
      qs.set("page", String(args.page ?? 1));
      qs.set("limit", String(Math.min(args.limit ?? 20, 100)));
      if (args.search) qs.set("search", args.search);
      const wrap = await api.list<BeCustomer[]>(`/customers?${qs}`);
      return {
        data: wrap.data.map((c) => adaptCustomer(c)),
        page: wrap.meta?.page ?? 1,
        limit: wrap.meta?.limit ?? 20,
        total: wrap.meta?.total ?? wrap.data.length,
        totalPages: wrap.meta?.totalPages ?? 1,
      };
    },
    async findMany(args: FindManyArgs = {}) {
      // BE caps page size at 100 — clamp here so callers passing 200+ don't
      // 400 back from the validator.
      const wrap = await api.list<BeCustomer[]>(
        `/customers?limit=${Math.min(args.take ?? 100, 100)}`,
      );
      if (args.include?.jobs) {
        const allJobs = await db.job.findMany();
        return wrap.data.map((c) =>
          adaptCustomer(c, allJobs.filter((j) => j.customerId === c.id)),
        );
      }
      return wrap.data.map((c) => adaptCustomer(c));
    },
    async findUnique(args: FindUniqueArgs) {
      try {
        const c = await api.get<BeCustomer>(`/customers/${args.where.id}`);
        if (args.include?.jobs) {
          const wrap = await api.list<BeJob[]>(
            `/jobs?customerId=${args.where.id}&limit=100`,
          );
          const techIdx = await fetchTechIndex();
          return adaptCustomer(c, wrap.data.map((j) => adaptJob(j, techIdx)));
        }
        return adaptCustomer(c);
      } catch {
        return null;
      }
    },
  },
  part: {
    async findMany() {
      const wrap = await api.list<BePart[]>(`/parts?limit=100`);
      return wrap.data.map(adaptPart);
    },
    async findPaginated(args: PaginatedArgs = {}): Promise<PaginatedResult<ReturnType<typeof adaptPart>>> {
      const qs = new URLSearchParams();
      qs.set("page", String(args.page ?? 1));
      qs.set("limit", String(Math.min(args.limit ?? 20, 100)));
      if (args.search) qs.set("search", args.search);
      const wrap = await api.list<BePart[]>(`/parts?${qs}`);
      return {
        data: wrap.data.map(adaptPart),
        page: wrap.meta?.page ?? 1,
        limit: wrap.meta?.limit ?? 20,
        total: wrap.meta?.total ?? wrap.data.length,
        totalPages: wrap.meta?.totalPages ?? 1,
      };
    },
  },
};
