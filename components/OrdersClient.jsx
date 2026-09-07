"use client";
import AdminShell from "@/components/AdminShell";
import { useState } from "react";

const STATUSES = ["new", "confirmed", "shipped", "closed", "cancelled"];

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

const items = (o) => {
  try {
    const a = JSON.parse(o.items);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
};

export default function OrdersClient({ orders }) {
  const [rows, setRows] = useState(orders);
  const [filter, setFilter] = useState("all");

  const setStatus = async (id, status) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this order permanently?")) return;
    setRows((rs) => rs.filter((r) => r.id !== id));
    await fetch(`/api/admin/orders?id=${id}`, { method: "DELETE" });
  };

  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const value = rows.filter((r) => ["confirmed", "shipped", "closed"].includes(r.status))
    .reduce((s, r) => s + (r.total || 0), 0);

  return (
    <AdminShell title="Orders" sub={`${rows.filter((r) => r.status === "new").length} new · ${rows.length} total · ${inr(value)} confirmed value`}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div className="filters">
          {["all", ...STATUSES].map((f) => (
            <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <a className="admin-btn ghost" href="/api/admin/orders/export">↓ Export CSV</a>
      </div>
      <div className="panel">
        {shown.length === 0 ? (
          <div className="empty-state">No orders yet — direct website orders land here instantly.</div>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Ref</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {shown.map((o) => {
                  const its = items(o);
                  const num = (o.phone || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
                  const wa = num ? `https://wa.me/${num}?text=${encodeURIComponent(`Hello ${o.name}! This is JHANARICH regarding your order ${o.ref}. We are confirming availability and delivery details.`)}` : null;
                  const preview = its.slice(0, 2).map((it) => `${it.name} × ${it.qty}`).join(", ") + (its.length > 2 ? ` +${its.length - 2} more` : "");
                  return (
                    <>
                      <tr key={o.id}>
                        <td style={{ whiteSpace: "nowrap", color: "var(--ink-faint)", fontSize: 12 }}>
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          <br />{new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td><span className="order-ref">{o.ref}</span></td>
                        <td>
                          <b>{o.name}</b>
                          {o.business && <><br /><span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{o.business}</span></>}
                          {o.phone && <><br /><span style={{ fontSize: 12 }}>{o.phone}</span></>}
                        </td>
                        <td style={{ maxWidth: 230, fontSize: 12 }}>{preview || "—"}</td>
                        <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                          {o.total !== null && o.total !== undefined ? inr(o.total) : <span style={{ color: "var(--ink-faint)", fontWeight: 400, fontSize: 12 }}>on request</span>}
                        </td>
                        <td>
                          <select
                            className={`pill ${o.status}`}
                            style={{ border: "none", cursor: "pointer", textTransform: "uppercase" }}
                            value={o.status}
                            onChange={(e) => setStatus(o.id, e.target.value)}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            {wa && <a className="wa-reply" href={wa} target="_blank" rel="noopener">Reply</a>}
                            {o.email && <a className="wa-reply" style={{ color: "var(--ink-soft)" }} href={`mailto:${o.email}?subject=${encodeURIComponent("Your JHANARICH order " + o.ref)}`}>✉</a>}
                            <button className="admin-btn danger" style={{ padding: "7px 12px" }} onClick={() => remove(o.id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                      <tr key={o.id + "-detail"} style={{ background: "#FBF8F1" }}>
                        <td></td>
                        <td colSpan={6} style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                          {its.map((it, i) => (
                            <div key={i}><b>{it.qty} × {it.name}</b> — {it.price !== null && it.price !== undefined ? `${inr(it.price)} / unit` : "price on request"}</div>
                          ))}
                          {o.address && <div style={{ marginTop: 6 }}><b>Address:</b> {o.address}</div>}
                          {o.notes && <div style={{ marginTop: 4 }}><b>Notes:</b> {o.notes}</div>}
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
