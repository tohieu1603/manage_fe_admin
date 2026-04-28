import { db } from "@/lib/data";
import { PageHeader, StatusChip } from "@/components/ui";
import { fmtVND } from "@/lib/utils";
import { notFound } from "next/navigation";
import AddDeviceButton from "./add-device-button";
import DeviceRowActions from "./device-row-actions";
import Link from "next/link";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.customer.findUnique({ where: { id }, include: { jobs: true, devices: true } });
  if (!c) notFound();
  const revenue = c.jobs.filter((j) => j.status === "done").reduce((s, j) => s + j.amount, 0);
  return (
    <div>
      <PageHeader title={c.name} subtitle={`${c.type} · ${c.address}`} />
      <div className="p-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <div className="p-5 border-b border-ink-150 flex items-center justify-between">
              <div className="font-semibold">Thiết bị quản lý ({c.devices.length})</div>
              <AddDeviceButton customerId={c.id} />
            </div>
            {c.devices.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-500">Chưa có thiết bị nào.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-ink-25 text-ink-500 text-left">
                  <tr>
                    <th className="px-5 py-2">Thiết bị</th>
                    <th className="px-5 py-2">Vị trí</th>
                    <th className="px-5 py-2">BD gần nhất</th>
                    <th className="px-5 py-2">BH</th>
                    <th className="px-5 py-2 w-20 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {c.devices.map((d) => (
                    <tr key={d.id} className="border-t border-ink-100">
                      <td className="px-5 py-3 font-medium">{d.name}</td>
                      <td className="px-5 py-3">{d.room}</td>
                      <td className="px-5 py-3">{d.lastService}</td>
                      <td className="px-5 py-3">{d.warranty}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end">
                          <DeviceRowActions customerId={c.id} device={d} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="p-5 border-b border-ink-150 font-semibold">
              Lịch sử dịch vụ ({c.jobs.length})
            </div>
            {c.jobs.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-500">Chưa có công việc nào.</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {c.jobs.map((j) => (
                    <tr key={j.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-25">
                      <td className="px-5 py-3 font-mono text-xs">
                        <Link href={`/jobs/${j.id}`} className="text-brand-600 hover:underline">
                          {j.code}
                        </Link>
                      </td>
                      <td className="px-5 py-3">{j.title}</td>
                      <td className="px-5 py-3">
                        <StatusChip status={j.status} />
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{fmtVND(j.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-xs text-ink-500">Tổng doanh thu</div>
            <div className="text-2xl font-bold text-ok-600 mt-1">{fmtVND(revenue)}</div>
          </div>
          <div className="card p-5 space-y-2 text-sm">
            {c.phone && <div><div className="text-xs text-ink-500">SĐT</div><div className="font-medium">{c.phone}</div></div>}
            <div><div className="text-xs text-ink-500">Khách hàng từ</div><div className="font-medium">{c.since}</div></div>
            <div><div className="text-xs text-ink-500">Số thiết bị</div><div className="font-medium">{c.units}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
