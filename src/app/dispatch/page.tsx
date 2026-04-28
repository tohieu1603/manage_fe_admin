import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import DispatchBoard from "./dispatch-board";

export default async function Dispatch() {
  const [techs, jobs] = await Promise.all([
    db.technician.findMany(),
    db.job.findMany({ include: { customer: true }, orderBy: { scheduledAt: "asc" } }),
  ]);

  const today = new Date();
  const subtitle = `Timeline theo kỹ thuật viên · ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  return (
    <div>
      <PageHeader title="Giao việc" subtitle={subtitle} />
      <DispatchBoard
        techs={techs.map((t) => ({
          id: t.id,
          name: t.name,
          skill: t.skill,
          color: t.color,
          initials: t.initials,
        }))}
        jobs={jobs.map((j) => ({
          id: j.id,
          code: j.code,
          title: j.title,
          type: j.type,
          scheduledAt: j.scheduledAt,
          duration: j.duration,
          technicianId: j.technicianId,
          customer: j.customer ? { name: j.customer.name } : null,
        }))}
      />
    </div>
  );
}
