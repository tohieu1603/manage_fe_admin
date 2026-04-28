import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.jobEvent.deleteMany();
  await prisma.job.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.part.deleteMany();

  const technicians = [
    { id: "kt01", name: "Nguyễn Văn Hùng", phone: "0903 412 558", initials: "HU", color: "#3B75F6", skill: "Lắp đặt", rating: 4.8, jobsMonth: 42, status: "onsite", location: "Q.1, TP.HCM", eta: "Về lúc 16:30" },
    { id: "kt02", name: "Trần Minh Khoa",  phone: "0912 667 821", initials: "KH", color: "#10B981", skill: "Sửa chữa", rating: 4.9, jobsMonth: 48, status: "traveling", location: "Đang đến Q.Bình Thạnh", eta: "ETA 10 phút" },
    { id: "kt03", name: "Lê Quang Duy",    phone: "0978 220 119", initials: "DU", color: "#F59E0B", skill: "Bảo dưỡng", rating: 4.7, jobsMonth: 36, status: "available", location: "Văn phòng", eta: "Sẵn sàng" },
    { id: "kt04", name: "Phạm Tuấn Anh",   phone: "0934 001 772", initials: "TA", color: "#8B5CF6", skill: "Lắp đặt", rating: 4.6, jobsMonth: 39, status: "onsite", location: "Q.7, TP.HCM", eta: "Đang thực hiện" },
    { id: "kt05", name: "Võ Thanh Tùng",   phone: "0901 558 230", initials: "TU", color: "#EF4444", skill: "Sửa chữa", rating: 4.5, jobsMonth: 31, status: "break", location: "Nghỉ trưa", eta: "Tiếp tục 13:30" },
    { id: "kt06", name: "Bùi Đức Mạnh",    phone: "0989 145 672", initials: "MA", color: "#0EA5E9", skill: "Bảo dưỡng", rating: 4.9, jobsMonth: 45, status: "available", location: "Gò Vấp", eta: "Sẵn sàng" },
    { id: "kt07", name: "Ngô Hải Đăng",    phone: "0919 773 004", initials: "ĐA", color: "#EC4899", skill: "Lắp đặt", rating: 4.4, jobsMonth: 28, status: "onsite", location: "Thủ Đức", eta: "Đang lắp đặt" },
    { id: "kt08", name: "Đỗ Công Thành",   phone: "0966 220 889", initials: "TH", color: "#14B8A6", skill: "Sửa chữa", rating: 4.7, jobsMonth: 41, status: "offline", location: "Nghỉ phép", eta: "Trở lại thứ 3" },
  ];
  for (const t of technicians) await prisma.technician.create({ data: t });

  const customers = [
    { id: "kh01", name: "Công ty TNHH Sao Việt", type: "Doanh nghiệp", address: "124 Nguyễn Công Trứ, Q.1, TP.HCM", phone: "028 3823 5445", units: 12, since: "2022" },
    { id: "kh02", name: "Chị Mai Phương", type: "Cá nhân", address: "89/12 Xô Viết Nghệ Tĩnh, Bình Thạnh", phone: "0903 412 558", units: 3, since: "2024" },
    { id: "kh03", name: "Anh Trần Văn Long", type: "Cá nhân", address: "Lô B12 Khu dân cư An Phú, Q.2", phone: "0912 667 821", units: 2, since: "2023" },
    { id: "kh04", name: "Khách sạn Bình Minh", type: "Doanh nghiệp", address: "22 Lý Tự Trọng, Q.1, TP.HCM", phone: "028 3822 7788", units: 28, since: "2021" },
    { id: "kh05", name: "Chị Nguyễn Thu Hà", type: "Cá nhân", address: "456 Cách Mạng Tháng 8, Q.10", phone: "0903 558 221", units: 2, since: "2025" },
    { id: "kh06", name: "Văn phòng Tín Phát", type: "Doanh nghiệp", address: "Toà CT4, Phú Mỹ Hưng, Q.7", phone: "028 5411 2233", units: 8, since: "2023" },
    { id: "kh07", name: "Anh Lê Hoàng Nam", type: "Cá nhân", address: "223 Võ Văn Ngân, Thủ Đức", phone: "0934 001 772", units: 1, since: "2025" },
    { id: "kh08", name: "Nhà hàng Hương Việt", type: "Doanh nghiệp", address: "18 Nguyễn Huệ, Q.1", phone: "028 3824 9911", units: 6, since: "2022" },
  ];
  for (const c of customers) await prisma.customer.create({ data: c });

  const devicesByCust: Record<string, Array<{name:string;room:string;lastService:string;warranty:string}>> = {
    kh01: [
      { name: "Daikin FTKC25UAVMV", room: "Phòng họp lớn", lastService: "12/03/2026", warranty: "còn 14 tháng" },
      { name: "Panasonic CU/CS-XU9", room: "Phòng giám đốc", lastService: "05/02/2026", warranty: "còn 8 tháng" },
      { name: "LG V13APF", room: "Khu tiếp tân", lastService: "22/01/2026", warranty: "hết bảo hành" },
      { name: "Mitsubishi MSY-GR25", room: "Phòng kỹ thuật", lastService: "18/12/2025", warranty: "còn 3 tháng" },
    ],
  };
  for (const [custId, list] of Object.entries(devicesByCust)) {
    for (const d of list) await prisma.device.create({ data: { ...d, customerId: custId } });
  }

  const jobs = [
    { id: "CV-2857", title: "Sửa điều hòa không lạnh, chảy nước", type: "Sửa chữa", priority: "high", status: "in_progress", customerId: "kh01", address: "124 Nguyễn Công Trứ, Q.1", technicianId: "kt01", createdAt: "2026-04-24 08:14", scheduledAt: "2026-04-24 10:00", device: "Daikin FTKC25UAVMV (2.5HP)", duration: "1h 30p", amount: 850000, notes: "Khách báo máy đã bảo dưỡng cách đây 6 tháng." },
    { id: "CV-2856", title: "Lắp đặt mới 2 điều hòa Panasonic", type: "Lắp đặt", priority: "med", status: "scheduled", customerId: "kh02", address: "89/12 Xô Viết Nghệ Tĩnh, Bình Thạnh", technicianId: "kt04", createdAt: "2026-04-24 07:50", scheduledAt: "2026-04-24 14:00", device: "Panasonic CU/CS-XU9UKH (1HP) x2", duration: "3h", amount: 2400000, notes: "Khoan tường, đi ống đồng 4m." },
    { id: "CV-2855", title: "Vệ sinh bảo dưỡng định kỳ", type: "Bảo dưỡng", priority: "low", status: "scheduled", customerId: "kh04", address: "22 Lý Tự Trọng, Q.1", technicianId: "kt06", createdAt: "2026-04-24 07:22", scheduledAt: "2026-04-24 15:30", device: "Hệ thống VRV Daikin (28 dàn lạnh)", duration: "4h", amount: 5600000, notes: "Hợp đồng bảo trì quý 2/2026." },
    { id: "CV-2854", title: "Kiểm tra rò gas, bơm gas R32", type: "Sửa chữa", priority: "med", status: "traveling", customerId: "kh03", address: "Lô B12 KDC An Phú, Q.2", technicianId: "kt02", createdAt: "2026-04-24 09:05", scheduledAt: "2026-04-24 11:00", device: "LG V13APF (1.5HP)", duration: "1h", amount: 620000, notes: "Máy kêu to khi khởi động." },
    { id: "CV-2853", title: "Thay board mạch điều khiển", type: "Sửa chữa", priority: "high", status: "pending", customerId: "kh06", address: "Toà CT4, Phú Mỹ Hưng, Q.7", technicianId: null, createdAt: "2026-04-24 09:30", scheduledAt: "2026-04-24 13:00", device: "Samsung AR09TYH (1HP) x2", duration: "2h", amount: 1850000, notes: "Cần xác nhận linh kiện có trong kho." },
    { id: "CV-2852", title: "Lắp đặt điều hòa âm trần", type: "Lắp đặt", priority: "med", status: "in_progress", customerId: "kh08", address: "18 Nguyễn Huệ, Q.1", technicianId: "kt07", createdAt: "2026-04-24 07:00", scheduledAt: "2026-04-24 09:00", device: "Daikin FCF71CVM (3HP)", duration: "5h", amount: 4200000, notes: "Cần thang dàn và 2 người hỗ trợ." },
    { id: "CV-2851", title: "Tháo dỡ, di dời 3 dàn lạnh", type: "Lắp đặt", priority: "low", status: "done", customerId: "kh05", address: "456 CMT8, Q.10", technicianId: "kt03", createdAt: "2026-04-23 14:00", scheduledAt: "2026-04-23 15:00", device: "Mitsubishi MSY-GR25VF (1HP) x3", duration: "2h 30p", amount: 1500000, notes: "Khách chuyển nhà." },
    { id: "CV-2850", title: "Xử lý máy bị đóng tuyết", type: "Sửa chữa", priority: "high", status: "done", customerId: "kh07", address: "223 Võ Văn Ngân, Thủ Đức", technicianId: "kt02", createdAt: "2026-04-23 10:12", scheduledAt: "2026-04-23 11:30", device: "Toshiba RAS-H10D2KCVG-V", duration: "1h 15p", amount: 720000, notes: "Vệ sinh + bơm gas bổ sung." },
  ];
  for (const j of jobs) await prisma.job.create({ data: j });

  const events = [
    { time: "08:14", actor: "CSKH — Thu Trang", action: "Tiếp nhận yêu cầu từ hotline", detail: "Khách: chị Nguyễn Thị Mai — Cty Sao Việt" },
    { time: "08:42", actor: "Điều phối — Lan Anh", action: "Giao việc cho kỹ thuật viên", detail: "Chỉ định KT Nguyễn Văn Hùng (chuyên Lắp đặt/Sửa chữa)" },
    { time: "09:15", actor: "KT — Nguyễn Văn Hùng", action: "Xác nhận & di chuyển", detail: "ETA 25 phút, chuẩn bị đồng hồ đo gas" },
    { time: "09:58", actor: "KT — Nguyễn Văn Hùng", action: "Đã đến hiện trường", detail: "Check-in GPS: 124 Nguyễn Công Trứ, Q.1" },
    { time: "10:12", actor: "KT — Nguyễn Văn Hùng", action: "Chẩn đoán: thiếu gas + nghẹt ống thoát", detail: "Đã chụp 4 ảnh hiện trường, khách xác nhận" },
    { time: "10:30", actor: "Hệ thống", action: "Tự động sinh báo giá bổ sung", detail: "Gas R32 (0.3kg) + vệ sinh ống thoát: 420.000đ" },
  ];
  for (let i = 0; i < events.length; i++) {
    await prisma.jobEvent.create({ data: { ...events[i], jobId: "CV-2857", order: i } });
  }

  const parts = [
    { id: "VT001", name: "Gas R32 (bình 11.3kg)", stock: 14, min: 5, unit: "bình", price: 1850000 },
    { id: "VT002", name: "Ống đồng Φ6.35", stock: 120, min: 50, unit: "m", price: 85000 },
    { id: "VT003", name: "Ống đồng Φ9.52", stock: 86, min: 30, unit: "m", price: 115000 },
    { id: "VT004", name: "Dây điện 2×2.5mm Cadivi", stock: 4, min: 20, unit: "cuộn", price: 420000 },
    { id: "VT005", name: "Board mạch Daikin FTKC", stock: 6, min: 2, unit: "cái", price: 1250000 },
    { id: "VT006", name: "Tụ quạt dàn nóng 4μF", stock: 32, min: 10, unit: "cái", price: 65000 },
  ];
  for (const p of parts) await prisma.part.create({ data: p });

  console.log("✓ Seed completed:", { technicians: technicians.length, customers: customers.length, jobs: jobs.length, parts: parts.length });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
