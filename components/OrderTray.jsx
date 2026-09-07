"use client";
import { useEffect, useState } from "react";

const KEY = "jr_order_tray";
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

function load() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export default function OrderTray() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("cart"); // cart | checkout | done
  const [busy, setBusy] = useState(false);
  const [bump, setBump] = useState(false);
  const [done, setDone] = useState(null); // {ref, wa}
  const [form, setForm] = useState({ name: "", phone: "", email: "", business: "", city: "", address: "", notes: "", website: "" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
    const add = (e) => {
      const d = e.detail || {};
      if (!d.slug) return;
      setItems((prev) => {
        const i = prev.findIndex((x) => x.slug === d.slug);
        const next = i >= 0
          ? prev.map((x, j) => (j === i ? { ...x, qty: Math.min(999, x.qty + 1) } : x))
          : [...prev, { slug: d.slug, name: d.name || d.slug, qty: 1, price: d.price ?? null }];
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
      setBump(true);
      setTimeout(() => setBump(false), 550);
    };
    window.addEventListener("jr:order", add);
    return () => window.removeEventListener("jr:order", add);
  }, []);

  const persist = (next) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const setQty = (slug, qty) =>
    persist(qty <= 0 ? items.filter((x) => x.slug !== slug) : items.map((x) => (x.slug === slug ? { ...x, qty } : x)));
  const close = () => {
    setOpen(false);
    setTimeout(() => { setStage("cart"); setDone(null); }, 350);
  };

  const total = items.reduce((s, x) => s + (x.price !== null && x.price !== undefined ? x.price * x.qty : 0), 0);
  const count = items.reduce((s, x) => s + x.qty, 0);
  const anyUnpriced = items.some((x) => x.price === null || x.price === undefined);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Could not place the order — please try WhatsApp instead.");
      setDone({ ref: d.ref, wa: d.wa });
      setStage("done");
      persist([]);
    } catch (err) {
      alert(err.message || "Could not place the order — please try WhatsApp instead.");
    } finally {
      setBusy(false);
    }
  };

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!ready) return null;

  return (
    <>
      {count > 0 && !open && (
        <button className={`order-fab${bump ? " bump" : ""}`} onClick={() => setOpen(true)} data-hover>
          ▤ Your order <b>{count}</b>
        </button>
      )}

      {open && (
        <>
          <div className="tray-backdrop" onClick={close} />
          <aside className="tray" role="dialog" aria-label="Order tray">
            <div className="tray-h">
              <div>
                <span className="fs" style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ember)" }}>
                  {stage === "done" ? "Order placed" : stage === "checkout" ? "Step 2 of 2 — Details" : "Direct order"}
                </span>
                <h3>{stage === "checkout" ? "Delivery details" : stage === "done" ? "Thank you!" : "Your order"}</h3>
              </div>
              <button className="tray-x" onClick={close} aria-label="Close">✕</button>
            </div>

            {stage === "cart" && (
              <>
                <div className="tray-items">
                  {items.length === 0 ? (
                    <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
                      Your tray is empty — tap <b>Order</b> on any product to build your requirement.
                    </div>
                  ) : (
                    items.map((x) => (
                      <div className="tray-item" key={x.slug}>
                        <div className="ti-info">
                          <b>{x.name}</b>
                          <span className="ti-unit">{x.price != null ? `${inr(x.price)} / unit` : "price on request"}</span>
                        </div>
                        <div className="qty">
                          <button onClick={() => setQty(x.slug, x.qty - 1)} aria-label="Less">−</button>
                          <b>{x.qty}</b>
                          <button onClick={() => setQty(x.slug, Math.min(999, x.qty + 1))} aria-label="More">+</button>
                        </div>
                        <span className="ti-line">{x.price != null ? inr(x.price * x.qty) : "—"}</span>
                        <button className="ti-rm" onClick={() => setQty(x.slug, 0)} aria-label="Remove">✕</button>
                      </div>
                    ))
                  )}
                </div>
                {items.length > 0 && (
                  <div className="tray-foot">
                    <div className="tray-total">
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                        {anyUnpriced ? "Estimated" : "Estimated total"}
                      </span>
                      <b>{inr(total)}{anyUnpriced ? "+" : ""}</b>
                    </div>
                    <p className="tray-note">Final quote confirmed on WhatsApp / email before dispatch</p>
                    <button className="tray-cta" onClick={() => setStage("checkout")} data-hover>Place order →</button>
                    <button className="tray-cta ghost" style={{ marginTop: 10 }} onClick={() => persist([])}>Clear tray</button>
                  </div>
                )}
              </>
            )}

            {stage === "checkout" && (
              <form className="tray-form" onSubmit={submit}>
                <input type="text" name="website" value={form.website} onChange={setF("website")} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
                <div className="tf-row">
                  <label>Full name *<input type="text" value={form.name} onChange={setF("name")} placeholder="Your name" required minLength={2} /></label>
                  <label>Phone / WhatsApp *<input type="tel" value={form.phone} onChange={setF("phone")} placeholder="+91 …" required /></label>
                </div>
                <div className="tf-row">
                  <label>Email<input type="email" value={form.email} onChange={setF("email")} placeholder="you@company.com" /></label>
                  <label>Business / firm<input type="text" value={form.business} onChange={setF("business")} placeholder="Optional" /></label>
                </div>
                <div className="tf-row">
                  <label>City<input type="text" value={form.city} onChange={setF("city")} placeholder="City" /></label>
                  <label>Delivery address<textarea rows={2} value={form.address} onChange={setF("address")} placeholder="Transport / address details" /></label>
                </div>
                <label>Notes<textarea rows={2} value={form.notes} onChange={setF("notes")} placeholder="Sizes, delivery timeline, GST… (optional)" /></label>
                <button className="tray-cta" type="submit" disabled={busy} data-hover style={{ marginTop: 8 }}>
                  {busy ? "Placing order…" : "Confirm order"}
                </button>
                <button type="button" className="tray-cta ghost" onClick={() => setStage("cart")}>← Back to tray</button>
              </form>
            )}

            {stage === "done" && done && (
              <div className="tray-done">
                <div className="big">Order received.</div>
                <span className="ref-chip">REF {done.ref}</span>
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 320 }}>
                  We&apos;ve logged your order and emailed you a confirmation. Send it to our team on WhatsApp to confirm availability and delivery.
                </p>
                {done.wa ? (
                  <a className="wa-big" href={done.wa} target="_blank" rel="noopener" data-hover>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.6-1-.9-2.1-.6-2.9.1-.4.4-.8.7-1.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.2.2-.2.4-.1.6a8 8 0 0 0 3.4 2.9c.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.2.4.3.4.5s0 .9-.1 1.3z"/></svg>
                    Send on WhatsApp
                  </a>
                ) : null}
                <button className="tray-cta ghost" style={{ maxWidth: 240 }} onClick={close}>Done</button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
