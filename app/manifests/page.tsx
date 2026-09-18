import Link from "next/link";

export default function ManifestsPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#6b7280" }}>← Dashboard</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 24px" }}>
          <h1 style={{ margin: 0 }}>Manifest</h1>
          <Link href="/manifests/new" style={{ padding: "10px 14px", borderRadius: 10, background: "#111827", color: "white", textDecoration: "none" }}>+ Buat Manifest</Link>
        </div>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, color: "#6b7280" }}>
          Belum ada manifest. Data akan terhubung ke Google Sheets pada tahap berikutnya.
        </div>
      </div>
    </main>
  );
}
