import Link from "next/link";

const stats = [
  { label: "Manifest Hari Ini", value: "0" },
  { label: "Total AWB", value: "0" },
  { label: "Seller", value: "0" },
  { label: "Pending", value: "0" },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>BGG16</p>
            <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>Manifest Retur</h1>
            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>Return Manifest Management System</p>
          </div>
          <Link href="/manifests/new" style={{ padding: "12px 16px", borderRadius: 10, background: "#111827", color: "white", textDecoration: "none", fontWeight: 700 }}>
            + Buat Manifest
          </Link>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 24 }}>
          {stats.map((item) => (
            <div key={item.label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{item.label}</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>{item.value}</div>
            </div>
          ))}
        </section>

        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Foundation v1</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
            Project foundation sudah dibuat. Tahap berikutnya adalah master data, pembuatan manifest dengan kode seller seperti ZR-20260918-001, lalu scanner AWB melalui kamera HP.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/manifests" style={{ color: "#111827" }}>Daftar Manifest</Link>
            <Link href="/scan" style={{ color: "#111827" }}>Scan AWB</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
