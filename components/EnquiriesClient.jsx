"use client";
import AdminShell from "@/components/AdminShell";
import { useState } from "react";

const waLink = (phone, name) => {
  const num = (phone || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
  const text = encodeURIComponent(`Hello ${name}! This is JHANARICH regarding your cookware enquiry.`);
  return num ? `https://wa.me/${num}?text=${text}` : null;
};

export default function EnquiriesClient({ enquiries }) {
  const [rows, setRows] = useState(enquiries);
  const [filter, setFilter] = useState("all");
  const [ai, setAi] = useState(null); // {row, reply, intent, urgency, busy}
  const [copied, setCopied] = useState(false);

  const runAI = async (row) => {
    setAi({ row, reply: "", intent: "", urgency: "", busy: true });
    const r = await fetch("/api/admin/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "reply", id: row.id }),
    });
    const j = await r.json();
    if (j.ok) setAi({ row, reply: j.reply, intent: j.intent, urgency: j.urgency, busy: false });
    else { setAi(null); alert(j.error || "AI failed"); }
  };

  const waDraft = () => {
    const num = (ai.row.phone || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
    return num ? `https://wa.me/${num}?text=${encodeURIComponent(ai.reply)}` : null;
  };

  const setStatus = async (id, status) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this enquiry permanently?")) return;
    setRows((rs) => rs.filter((r) => r.id !== id));
    await fetch(`/api/admin/enquiries?id=${id}`, { method: "DELETE" });
  };

  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <AdminShell title="Enquiries" sub={`${rows.filter((r) => r.status === "new").length} new · ${rows.length} total`}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div className="filters">
          {["all", "new", "contacted", "closed"].map((f) => (
            <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <a className="admin-btn ghost" href="/api/admin/enquiries/export">↓ Export CSV</a>
      </div>
      <div className="panel">
        {shown.length === 0 ? (
          <div className="empty-state">Nothing here yet.</div>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Contact</th><th>Interest</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--ink-faint)", fontSize: 12 }}>
                      {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      <br />{new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <b>{e.name}</b>
                      <br />
                      {e.phone && <span style={{ fontSize: 12 }}>{e.phone}</span>}
                      {e.email && <><br /><span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{e.email}</span></>}
                      {e.business && <><br /><span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{e.business}</span></>}
                    </td>
                    <td style={{ maxWidth: 150 }}>{e.product || e.line || "—"}</td>
                    <td style={{ maxWidth: 240, fontSize: 13, color: "var(--ink-soft)" }}>{e.message || "—"}</td>
                    <td>
                      <select
                        className={`pill ${e.status}`}
                        style={{ border: "none", cursor: "pointer", textTransform: "uppercase" }}
                        value={e.status}
                        onChange={(ev) => setStatus(e.id, ev.target.value)}
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="closed">closed</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <button className="admin-btn" style={{ padding: "7px 12px", background: "var(--gold)" }} onClick={() => runAI(e)}>✦ AI</button>
                        {waLink(e.phone, e.name) && (
                          <a className="wa-reply" href={waLink(e.phone, e.name)} target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.6-1-.9-2.1-.6-2.9.1-.4.4-.8.7-1.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.2.4-.1.6a8 8 0 0 0 3.4 2.9c.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.2.4.3.4.5s0 .9-.1 1.3z"/></svg>
                            Reply
                          </a>
                        )}
                        <button className="admin-btn danger" style={{ padding: "7px 12px" }} onClick={() => remove(e.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ai && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(21,16,9,.55)", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 20 }} onClick={() => setAi(null)}>
          <div className="panel" style={{ width: "min(480px,100%)", padding: 24, margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="panel-h" style={{ border: "none", padding: "0 0 14px" }}>
              <span>✦ AI draft — {ai.row.name}</span>
              {ai.intent && <span className={`pill ${ai.urgency === "high" ? "new" : "contacted"}`}>{ai.intent} · {ai.urgency} urgency</span>}
            </div>
            {ai.busy ? (
              <div className="empty-state">Reading the enquiry and drafting…</div>
            ) : (
              <>
                <textarea className="admin-input" rows={7} value={ai.reply} onChange={(e) => setAi({ ...ai, reply: e.target.value })} />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  {waDraft() ? (
                    <a className="admin-btn" style={{ textDecoration: "none" }} href={waDraft()} target="_blank" rel="noopener">Send on WhatsApp ↗</a>
                  ) : (
                    <button className="admin-btn ghost" onClick={() => { navigator.clipboard?.writeText(ai.reply); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      {copied ? "Copied ✓" : "Copy draft"}
                    </button>
                  )}
                  <button className="admin-btn ghost" onClick={() => setAi(null)}>Close</button>
                </div>
                {!ai.row.phone && <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 12 }}>No phone on this enquiry — copy the draft or reply by email.</p>}
              </>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
