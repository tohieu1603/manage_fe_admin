# CoolOps — Hệ thống quản lý dịch vụ điều hòa

Ứng dụng Next.js 15 + TypeScript + Tailwind + Prisma + SQLite cho công ty dịch vụ điều hòa.

## Tính năng

**4 vai trò** (chuyển bằng dropdown ở topbar, lưu trong localStorage):
- **Điều phối viên** — Tổng quan, Công việc, Giao việc, Lịch, Bản đồ, Khách hàng, Kho, Báo cáo
- **Chủ doanh nghiệp** — Executive dashboard (doanh thu, NPS, sức khoẻ vận hành, top KTV)
- **Nhân viên CSKH** — Tạo yêu cầu, hàng chờ cuộc gọi, đánh giá khách hàng
- **Kỹ thuật viên** — App mobile mô phỏng (timer, checklist, chụp ảnh, nghiệm thu)

**10+ màn hình**: Dashboard · Jobs list · Job detail (+timeline) · Dispatch board · Calendar · Map · Owner · CSKH · Technician · Customers (list + detail) · Inventory · Reports.

## Chạy thử

```bash
cd nextjs-app
npm install
cp .env.example .env
npm run db:push       # tạo SQLite schema
npm run db:seed       # nạp dữ liệu mẫu
npm run dev           # http://localhost:3000
```

Sau đó mở http://localhost:3000 — mặc định vào `/dashboard` với vai trò **Điều phối viên**. Đổi vai trò ở dropdown góc trên bên phải.

## Cấu trúc

```
nextjs-app/
├── prisma/
│   ├── schema.prisma       # Technician, Customer, Device, Job, JobEvent, Part
│   └── seed.ts             # dữ liệu mẫu tiếng Việt
├── src/
│   ├── app/
│   │   ├── layout.tsx      # RoleProvider + AppShell
│   │   ├── dashboard/      # Tổng quan
│   │   ├── jobs/           # list + [id]/ detail
│   │   ├── dispatch/       # timeline giao việc
│   │   ├── calendar/       # week view
│   │   ├── map/            # bản đồ KTV
│   │   ├── owner/          # executive dashboard
│   │   ├── cskh/           # trung tâm CSKH
│   │   ├── tech/           # app mobile KTV
│   │   ├── customers/      # list + [id]/ detail
│   │   ├── inventory/      # kho vật tư
│   │   └── reports/        # báo cáo
│   ├── components/
│   │   ├── app-shell.tsx   # sidebar + topbar + role switcher
│   │   ├── role-provider.tsx
│   │   └── ui.tsx          # StatusChip, Avatar, PageHeader…
│   └── lib/
│       ├── prisma.ts, utils.ts, roles.ts
└── tailwind.config.ts
```

Mọi page là React Server Component đọc trực tiếp từ Prisma. Role switcher là Client Component lưu vai trò vào `localStorage` và re-render sidebar theo quyền.

## Script

- `npm run dev` — dev server
- `npm run build` — production build (tự chạy `prisma generate`)
- `npm run db:reset` — xoá sạch + seed lại

## Ghi chú

- Sidebar nav thay đổi theo vai trò (config trong `src/lib/roles.ts`).
- Bản đồ là SVG mô phỏng (không gọi tile service thật).
- Muốn thêm màn hình: tạo `src/app/<route>/page.tsx` và thêm entry vào `ROLES[...].nav`.
