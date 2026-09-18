"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Manifest = { manifest_id: string; manifest_number: string; manifest_date: string; shift: string; drop_point: string; sprinter_id: string; seller_code: string; total_awb: number | string; status: string };

export default function ManifestsPage() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/manifests")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Gagal memuat manifest.");
        setManifests(data.manifests ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat manifest."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#6b7280" }}>← Dashboard</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, margin: "18px 0 24px" }}>
          <div><p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>BGG16</p><h1 style={{ margin: "5px 0 0" }}>Manifest</h1></div>
          <Link href="/manifests/new" style={{ padding: "10px 14px", borderRadius: 10, background: "#111827", color: "white", textDecoration: "none", fontWeight: 700 }}>+ Buat Manifest</Link>
        </div>

        {error && <div role="alert" style={{ padding: 14, borderRadius: 10, background: "#fef2f2", color: "#991b1b", marginBottom: 16 }}>{error}</div>}
        {loading ? <div style={{ padding: 24, background: "white", border: "1px solid #e5e7eb", borderRadius: 14 }}>Memuat manifest...</div> : manifests.length === 0 ? <div style={{ padding: 24, background: "white", border: "1px solid #e5e7eb", borderRadius: 14, color: "#6b7280" }}>Belum ada manifest. Buat manifest pertama untuk mulai scan AWB.</div> : (
          <div style={{ display: "grid", gap: 12 }}>
            {manifests.slice().reverse().map((manifest) => (
              <article key={manifest.manifest_id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div><strong style={{ fontSize: 18 }}>{manifest.manifest_number}</strong><div style={{ marginTop: 5, color: "#6b7280" }}>{manifest.sprinter_id} • {manifest.shift} • {manifest.manifest_date}</div></div>
                  <span style={{ alignSelf: "flex-start", padding: "5px 9px", borderRadius: 999, background: "#f3f4f6", fontSize: 12, fontWeight: 700 }}>{manifest.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                  <span>{manifest.total_awb || 0} AWB</span>
                  <Link href={`/scan?manifestId=${encodeURIComponent(manifest.manifest_id)}&manifestNumber=${encodeURIComponent(manifest.manifest_number)}`} style={{ color: "#111827", fontWeight: 700 }}>Scan AWB →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
