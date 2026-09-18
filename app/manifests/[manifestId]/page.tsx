"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ManifestStatus = "DRAFT" | "READY" | "IN_DELIVERY" | "HANDED_OVER" | "COMPLETED" | "CANCELLED";
type Manifest = {
  manifest_id: string;
  manifest_number: string;
  manifest_date: string;
  shift: string;
  drop_point: string;
  sprinter_id: string;
  seller_code: string;
  total_awb: number | string;
  status: ManifestStatus;
  handed_over_at?: string;
  received_by?: string;
  received_phone?: string;
  notes?: string;
};
type Item = { awb: string };

const transitions: Record<ManifestStatus, ManifestStatus[]> = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["IN_DELIVERY", "CANCELLED"],
  IN_DELIVERY: ["HANDED_OVER"],
  HANDED_OVER: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const statusLabel: Record<ManifestStatus, string> = {
  DRAFT: "Draft",
  READY: "Ready",
  IN_DELIVERY: "Dalam Pengiriman",
  HANDED_OVER: "Serah Terima",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default function ManifestDetailPage() {
  const params = useParams<{ manifestId: string }>();
  const manifestId = params.manifestId;
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [receivedPhone, setReceivedPhone] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    setError("");
    try {
      const response = await fetch(`/api/manifests/${encodeURIComponent(manifestId)}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Gagal memuat manifest.");
      setManifest(data.manifest);
      setItems(data.items ?? []);
      setReceivedBy(data.manifest.received_by ?? "");
      setReceivedPhone(data.manifest.received_phone ?? "");
      setNotes(data.manifest.notes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat manifest.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (manifestId) load();
  }, [manifestId]);

  async function changeStatus(status: ManifestStatus) {
    if (!manifest) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/manifests/${encodeURIComponent(manifest.manifest_id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          receivedBy,
          receivedPhone,
          notes,
          handedOverAt: status === "HANDED_OVER" ? new Date().toISOString() : undefined,
          userId: "WEB_USER",
          device: "WEB",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Status gagal diperbarui.");
      setManifest(data.manifest);
      setItems(data.items ?? items);
      setMessage(`Status berhasil diubah menjadi ${statusLabel[status]}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status gagal diperbarui.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main style={{ minHeight: "100vh", padding: 16 }}><div style={{ maxWidth: 900, margin: "0 auto" }}>Memuat detail manifest...</div></main>;

  if (!manifest) return <main style={{ minHeight: "100vh", padding: 16 }}><div style={{ maxWidth: 900, margin: "0 auto" }}><Link href="/manifests">← Manifest</Link><div role="alert" style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#fef2f2", color: "#991b1b" }}>{error || "Manifest tidak ditemukan."}</div></div></main>;

  const nextStatuses = transitions[manifest.status];
  const terminal = nextStatuses.length === 0;

  return (
    <main style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/manifests" style={{ color: "#6b7280" }}>← Daftar Manifest</Link>

        <header style={{ margin: "18px 0 20px" }}>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>MANIFEST • BGG16</p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: "5px 0" }}>{manifest.manifest_number}</h1>
              <p style={{ margin: 0, color: "#6b7280" }}>{manifest.manifest_date} • {manifest.shift} • {manifest.sprinter_id}</p>
            </div>
            <span style={{ padding: "7px 11px", borderRadius: 999, background: "#f3f4f6", fontWeight: 800, fontSize: 13 }}>{statusLabel[manifest.status]}</span>
          </div>
        </header>

        {error && <div role="alert" style={{ marginBottom: 12, padding: 14, borderRadius: 10, background: "#fef2f2", color: "#991b1b" }}>{error}</div>}
        {message && <div style={{ marginBottom: 12, padding: 14, borderRadius: 10, background: "#f0fdf4", color: "#166534" }}>{message}</div>}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}><div style={{ color: "#6b7280", fontSize: 13 }}>Seller</div><strong>{manifest.seller_code || "-"}</strong></div>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}><div style={{ color: "#6b7280", fontSize: 13 }}>Drop Point</div><strong>{manifest.drop_point || "-"}</strong></div>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}><div style={{ color: "#6b7280", fontSize: 13 }}>Total AWB</div><strong style={{ fontSize: 24 }}>{items.length}</strong></div>
        </section>

        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div><h2 style={{ margin: 0 }}>Operasional</h2><p style={{ margin: "5px 0 0", color: "#6b7280" }}>Ikuti urutan lifecycle manifest yang ditentukan sistem.</p></div>
            {manifest.status !== "COMPLETED" && manifest.status !== "CANCELLED" && <Link href={`/scan?manifestId=${encodeURIComponent(manifest.manifest_id)}&manifestNumber=${encodeURIComponent(manifest.manifest_number)}`} style={{ padding: "10px 13px", borderRadius: 10, background: "#111827", color: "white", textDecoration: "none", fontWeight: 700 }}>Scan AWB</Link>}
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {["DRAFT", "READY", "IN_DELIVERY", "HANDED_OVER", "COMPLETED"].map((status, index) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ padding: "7px 10px", borderRadius: 999, border: "1px solid #d1d5db", background: manifest.status === status ? "#111827" : "#fff", color: manifest.status === status ? "white" : "#374151", fontSize: 12, fontWeight: 800 }}>{statusLabel[status as ManifestStatus]}</span>
                {index < 4 && <span style={{ color: "#9ca3af" }}>→</span>}
              </div>
            ))}
          </div>

          {manifest.status === "HANDED_OVER" && (
            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <label style={{ fontWeight: 700 }}>Penerima serah terima<input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Nama penerima" style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: 12, border: "1px solid #d1d5db", borderRadius: 10 }} /></label>
              <label style={{ fontWeight: 700 }}>No. HP penerima<input value={receivedPhone} onChange={(e) => setReceivedPhone(e.target.value)} placeholder="08xxxxxxxxxx" style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: 12, border: "1px solid #d1d5db", borderRadius: 10 }} /></label>
              <label style={{ fontWeight: 700 }}>Catatan<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Catatan serah terima (opsional)" style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: 12, border: "1px solid #d1d5db", borderRadius: 10, resize: "vertical" }} /></label>
            </div>
          )}

          <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {nextStatuses.map((status) => (
              <button key={status} onClick={() => changeStatus(status)} disabled={saving || (status === "READY" && items.length === 0)} style={{ padding: "11px 14px", border: 0, borderRadius: 10, background: "#111827", color: "white", fontWeight: 800, opacity: saving || (status === "READY" && items.length === 0) ? 0.5 : 1 }}>
                {saving ? "Menyimpan..." : `Ubah ke ${statusLabel[status]}`}
              </button>
            ))}
          </div>
          {manifest.status === "DRAFT" && items.length === 0 && <p style={{ marginBottom: 0, color: "#92400e", fontSize: 13 }}>Tambahkan minimal 1 AWB sebelum manifest dapat menjadi READY.</p>}
          {terminal && <p style={{ marginBottom: 0, color: "#6b7280", fontSize: 13 }}>Status ini bersifat final dan tidak memiliki transisi lanjutan.</p>}
        </section>

        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ margin: 0 }}>Daftar AWB</h2><strong>{items.length}</strong></div>
          {items.length === 0 ? <p style={{ color: "#6b7280" }}>Belum ada AWB.</p> : <ol style={{ paddingLeft: 24, maxHeight: 360, overflow: "auto" }}>{items.map((item, index) => <li key={`${item.awb}-${index}`} style={{ padding: "7px 0", fontFamily: "monospace" }}>{item.awb}</li>)}</ol>}
        </section>
      </div>
    </main>
  );
}
