"use client";
import AdminShell from "@/components/AdminShell";
import { useState } from "react";

const CATS = [
  { key: "triply", label: "Triply" },
  { key: "nonstick", label: "Non-Stick" },
  { key: "steel", label: "Stainless Steel" },
  { key: "handles", label: "Handles" },
  { key: "plastic", label: "Plastic" },
];

export default function ProductsClient({ products }) {
  const [rows, setRows] = useState(products);
  const [editing, setEditing] = useState(null); // product being edited
  const [editDesc, setEditDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [createDesc, setCreateDesc] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const aiWrite = async (name, category, hints, setter) => {
    if (!name) { alert("Add a product name first — the writer needs it."); return; }
    setAiBusy(true);
    try {
      const r = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "description", name, category, hints }),
      });
      const j = await r.json();
      if (j.ok) setter(j.text); else alert(j.error || "AI failed");
    } catch { alert("AI failed"); }
    setAiBusy(false);
  };

  const patch = async (id, data) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...data } : r)));
    if (editing && editing.id === id) setEditing({ ...editing, ...data });
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this product permanently?")) return;
    setRows((rs) => rs.filter((r) => r.id !== id));
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
  };

  const create = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fd),
    });
    if (res.ok) {
      const { product } = await res.json();
      setRows((rs) => [...rs, product]);
      setAdding(false);
    }
  };

  const shown = filter === "all" ? rows : rows.filter((r) => r.category === filter);

  return (
    <AdminShell title="Products" sub={`${rows.length} in catalogue · ${rows.filter((r) => r.active).length} live on site`}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div className="filters">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>all</button>
          {CATS.map((c) => (
            <button key={c.key} className={filter === c.key ? "on" : ""} onClick={() => setFilter(c.key)}>{c.label.toLowerCase()}</button>
          ))}
        </div>
        <button className="admin-btn" onClick={() => { setCreateDesc(""); setAdding(true); }}>+ Add product</button>
      </div>

      {adding && (
        <form className="panel" onSubmit={create} style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          <div className="field-g"><label>Name</label><input name="name" className="admin-input" required /></div>
          <div className="field-g"><label>Category</label>
            <select name="category" className="admin-select">{CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
          </div>
          <div className="field-g"><label>Image path (/assets/…)</label><input name="image" className="admin-input" placeholder="/assets/image3.jpg" /></div>
          <div className="field-g"><label>Description</label><input name="description" className="admin-input" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} /></div>
          <div className="field-g"><label>&nbsp;</label>
            <button type="button" className="admin-btn ghost" disabled={aiBusy} onClick={(ev) => {
              const form = ev.currentTarget.closest("form");
              aiWrite(form?.name?.value || "", form?.category?.value || "", "", setCreateDesc);
            }}>{aiBusy ? "Writing…" : "✦ AI Write"}</button>
          </div>
          <div className="field-g"><label>Sort order</label><input name="sortOrder" type="number" className="admin-input" defaultValue={99} /></div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <button className="admin-btn" type="submit">Create</button>
            <button className="admin-btn ghost" type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="panel">
        <div className="table-scroll">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Image</th><th>Order</th><th>Live</th><th>Featured</th><th></th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)", maxWidth: 260 }}>{p.description}</div>
                  </td>
                  <td>
                    <select className="admin-select" style={{ width: 140, padding: "7px 10px" }} value={p.category}
                      onChange={(e) => patch(p.id, { category: e.target.value })}>
                      {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </td>
                  <td style={{ width: 76 }}>
                    {p.image && !p.image.startsWith("svg:")
                      ? <img src={p.image} alt="" style={{ width: 56, height: 42, objectFit: "contain", background: "#F6F1E7", borderRadius: 8, padding: 3 }} />
                      : <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)" }}>SVG</span>}
                  </td>
                  <td style={{ width: 80 }}>
                    <input className="admin-input" type="number" style={{ width: 64, padding: "7px 8px" }} defaultValue={p.sortOrder}
                      onBlur={(e) => Number(e.target.value) !== p.sortOrder && patch(p.id, { sortOrder: Number(e.target.value) })} />
                  </td>
                  <td>
                    <button onClick={() => patch(p.id, { active: !p.active })} className={`pill ${p.active ? "live" : "hidden"}`} style={{ border: "none", cursor: "pointer" }}>
                      {p.active ? "live" : "hidden"}
                    </button>
                  </td>
                  <td>
                    <input type="checkbox" checked={p.featured} onChange={(e) => patch(p.id, { featured: e.target.checked })} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="admin-btn ghost" style={{ padding: "7px 12px" }} onClick={() => { setEditDesc(""); setEditing({ ...p }); }}>Edit</button>
                      <button className="admin-btn danger" style={{ padding: "7px 12px" }} onClick={() => remove(p.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(21,16,9,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }} onClick={() => setEditing(null)}>
          <form className="panel" style={{ width: "min(560px,100%)", padding: 26 }} onClick={(e) => e.stopPropagation()}
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = Object.fromEntries(new FormData(e.target).entries());
              await patch(editing.id, fd);
              setEditing(null);
            }}>
            <div className="panel-h" style={{ margin: "-26px -26px 20px", paddingLeft: 26 }}><span>Edit — {editing.name}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field-g"><label>Name</label><input name="name" className="admin-input" defaultValue={editing.name} required /></div>
              <div className="field-g"><label>Category</label>
                <select name="category" className="admin-select" defaultValue={editing.category}>
                  {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="field-g" style={{ gridColumn: "1/-1" }}><label>Description</label>
                <textarea name="description" className="admin-input" value={editDesc || editing.description} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
                <button type="button" className="admin-btn ghost" style={{ marginTop: 10 }} disabled={aiBusy}
                  onClick={() => aiWrite(editing.name, editing.category, "", setEditDesc)}>
                  {aiBusy ? "Writing…" : "✦ AI Write description"}
                </button>
              </div>
              <div className="field-g" style={{ gridColumn: "1/-1" }}><label>Image path</label>
                <input name="image" className="admin-input" defaultValue={editing.image} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="admin-btn" type="submit">Save changes</button>
              <button className="admin-btn ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
