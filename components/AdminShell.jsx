"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◆" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "✉" },
  { href: "/admin/products", label: "Products", icon: "▣" },
];

export default function AdminShell({ children, title, sub }) {
  const path = usePathname();
  const r = useRouter();
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    r.push("/admin/login");
    r.refresh();
  };
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">
          <img src="/assets/logo.png" alt="JHANARICH" />
          <b>JHANARICH</b>
        </div>
        <div className="lbl">Console</div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={path === n.href ? "active" : ""}>
            <span>{n.icon}</span>{n.label}
          </Link>
        ))}
        <div className="lbl">Site</div>
        <Link href="/"><span>↗</span>View website</Link>
        <div className="foot">Jhanarich Pvt Ltd<br />Visakhapatnam, IN</div>
      </aside>
      <main className="admin-main">
        <div className="admin-top">
          <div>
            <h1 className="admin-h1">{title}</h1>
            <div className="admin-sub">{sub}</div>
          </div>
          <button className="admin-btn ghost" onClick={logout}>Sign out</button>
        </div>
        {children}
      </main>
    </div>
  );
}
