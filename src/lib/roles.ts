export type RoleKey = "dispatcher" | "owner" | "cskh" | "technician";

export type Role = {
  key: RoleKey;
  /** Display label of the role (e.g. "Điều phối viên"). User name comes
   * from the authenticated session, not this config. */
  role: string;
  /** Default placeholder name shown only when session.user.name is empty. */
  name: string;
  initials: string;
  bg: string;
  fg: string;
  defaultPage: string;
  nav: { group: string; items: { id: string; label: string; icon: string; badge?: string; hot?: boolean; href: string }[] }[];
};

// Maps the BE role enum (admin/dispatcher/owner/cskh/technician) to the
// CoolOps RoleKey. Admin defaults to dispatcher's view (full operator UI).
export function beRoleToKey(beRole: string): RoleKey {
  switch (beRole) {
    case "owner":
      return "owner";
    case "cskh":
      return "cskh";
    case "technician":
      return "technician";
    case "admin":
    case "dispatcher":
    default:
      return "dispatcher";
  }
}

// Compute initials from a person's full name.
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[parts.length - 1]?.[0] ?? "") + (parts[0]?.[0] ?? "")).toUpperCase();
}

export const ROLES: Record<RoleKey, Role> = {
  dispatcher: {
    key: "dispatcher", name: "Lan Anh Nguyễn", role: "Điều phối viên", initials: "LA",
    bg: "#E0E7FF", fg: "#3730A3", defaultPage: "/dashboard",
    nav: [
      { group: "Làm việc", items: [
        { id: "dashboard", label: "Tổng quan",      icon: "LayoutDashboard", href: "/dashboard" },
        { id: "jobs",      label: "Công việc",      icon: "ClipboardList", badge: "24", href: "/jobs" },
        { id: "dispatch",  label: "Giao việc",      icon: "Columns3", badge: "6", hot: true, href: "/dispatch" },
        { id: "calendar",  label: "Lịch làm việc",  icon: "Calendar", href: "/calendar" },
        { id: "map",       label: "Bản đồ đội ngũ", icon: "Map", href: "/map" },
      ]},
      { group: "Dữ liệu", items: [
        { id: "customers",   label: "Khách hàng",     icon: "Users", href: "/customers" },
        { id: "technicians", label: "Kỹ thuật viên",  icon: "HardHat", href: "/technicians" },
        { id: "inventory",   label: "Kho vật tư",     icon: "Package", href: "/inventory" },
        { id: "reports",     label: "Báo cáo",        icon: "BarChart3", href: "/reports" },
      ]},
    ],
  },
  owner: {
    key: "owner", name: "Ông Phạm Minh Đức", role: "Chủ doanh nghiệp", initials: "MD",
    bg: "#FEF3C7", fg: "#92400E", defaultPage: "/owner",
    nav: [
      { group: "Điều hành", items: [
        { id: "owner",       label: "Tổng quan DN",     icon: "LayoutDashboard", href: "/owner" },
        { id: "reports",     label: "Báo cáo chi tiết", icon: "BarChart3", href: "/reports" },
        { id: "customers",   label: "Khách hàng",       icon: "Users", href: "/customers" },
        { id: "technicians", label: "Kỹ thuật viên",    icon: "HardHat", href: "/technicians" },
        { id: "jobs",        label: "Công việc",        icon: "ClipboardList", href: "/jobs" },
        { id: "inventory",   label: "Kho vật tư",       icon: "Package", href: "/inventory" },
        { id: "map",         label: "Bản đồ đội ngũ",   icon: "Map", href: "/map" },
      ]},
    ],
  },
  cskh: {
    key: "cskh", name: "Thu Trang Đinh", role: "Nhân viên CSKH", initials: "TT",
    bg: "#FCE7F3", fg: "#9D174D", defaultPage: "/cskh",
    nav: [
      { group: "CSKH", items: [
        { id: "cskh",     label: "Trung tâm",      icon: "LayoutDashboard", href: "/cskh" },
        { id: "jobs",     label: "Yêu cầu đã tạo", icon: "ClipboardList", badge: "12", href: "/jobs" },
        { id: "customers",label: "Khách hàng",     icon: "Users", href: "/customers" },
        { id: "calendar", label: "Lịch hẹn",       icon: "Calendar", href: "/calendar" },
      ]},
    ],
  },
  technician: {
    key: "technician", name: "Nguyễn Văn Hùng", role: "Kỹ thuật viên", initials: "HU",
    bg: "#DBEAFE", fg: "#1E40AF", defaultPage: "/tech",
    nav: [
      { group: "KTV", items: [
        { id: "tech",  label: "App mobile",    icon: "Smartphone", href: "/tech" },
        { id: "jobs",  label: "Việc của tôi", icon: "ClipboardList", badge: "5", href: "/jobs" },
        { id: "map",   label: "Bản đồ",       icon: "Map", href: "/map" },
      ]},
    ],
  },
};
