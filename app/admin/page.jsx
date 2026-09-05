import { prisma } from "@/lib/db";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [enqNew, enqTotal, prodCount, latest, byCat] = await Promise.all([
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.enquiry.count(),
    prisma.product.count(),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const max = Math.max(1, ...byCat.map((c) => c._count._all));
  const catLabel = { triply: "Triply", nonstick: "Non-Stick", steel: "Stainless Steel", handles: "Handles", plastic: "Plastic" };

  return (
    <AdminShell title="Overview" sub="Business pulse — updated live">
      <div className="stat-grid">
        <div className="stat-card"><b>{enqNew}</b><span>New enquiries</span></div>
        <div className="stat-card"><b>{enqTotal}</b><span>Total enquiries</span></div>
        <div className="stat-card"><b>{prodCount}</b><span>Products live</span></div>
        <div className="stat-card"><b>{byCat.length}</b><span>Categories active</span></div>
      </div>

      <div className="panel">
        <div className="panel-h"><span>Catalogue composition</span><Link href="/admin/products" style={{ color: "var(--ember)" }}>Manage →</Link></div>
        <div className="bar-chart">
          {byCat.map((c) => (
            <div className="bar-row" key={c.category}>
              <span>{catLabel[c.category] || c.category}</span>
              <div className="track"><div className="bar" style={{ width: `${(c._count._all / max) * 100}%` }} /></div>
              <b>{c._count._all}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h"><span>Latest enquiries</span><Link href="/admin/enquiries" style={{ color: "var(--ember)" }}>View all →</Link></div>
        {latest.length === 0 ? (
          <div className="empty-state">No enquiries yet — they land here in real time.</div>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Name</th><th>Business</th><th>Interest</th><th>Status</th></tr></thead>
              <tbody>
                {latest.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--ink-faint)", fontSize: 12 }}>{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td><b>{e.name}</b></td>
                    <td>{e.business || "—"}</td>
                    <td>{e.product || e.line || "—"}</td>
                    <td><span className={`pill ${e.status}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
