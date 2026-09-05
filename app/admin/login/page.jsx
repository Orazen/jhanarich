"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const r = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    if (res.ok) { r.push("/admin"); r.refresh(); }
    else { setErr((await res.json()).error || "Login failed"); setBusy(false); }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img src="/assets/logo.png" alt="JHANARICH" />
        <h1>Admin Console</h1>
        <span className="sub">Jhanarich Private Limited</span>
        <div className="field-g" style={{ marginBottom: 14 }}>
          <label>Username</label>
          <input className="admin-input" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field-g" style={{ marginBottom: 20 }}>
          <label>Password</label>
          <input className="admin-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" required />
        </div>
        {err && <p style={{ color: "#b3372c", fontSize: 13, marginBottom: 14 }}>{err}</p>}
        <button className="admin-btn" style={{ width: "100%", justifyContent: "center", padding: "14px" }} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
