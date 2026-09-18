"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sellerCodeFromName, formatManifestNumber } from "@/lib/manifest";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewManifestPage() {
  const router = useRouter();
  const [seller, setSeller] = useState("ZR FASHION");
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState("PAGI");
  const [sprinter, setSprinter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const code = useMemo(() => sellerCodeFromName(seller), [seller]);
  const preview = formatManifestNumber(code, date, 1) + " (sequence otomatis)";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerName: seller, date, shift, sprinterName: sprinter, dropPoint: "BGG16" }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Gagal membuat manifest.");
      router.push(`/scan?manifestId=${encodeURIComponent(result.manifest.manifest_id)}&manifestNumber=${encodeURIComponent(result.manifest.manifest_number)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat manifest.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/manifests" style={{ color: "#6b7280" }}>← Manifest</Link>
        <div style={{ margin: "18px 0 24px" }}>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>BGG16 • Operasional Kurir</p>
          <h1 style={{ margin: "6px 0 0" }}>Buat Manifest Retur</h1>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
          <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label>Tanggal<input required value={date} onChange={(e) => setDate(e.target.value)} type="date" style={{ width: "100%", padding: 12, marginTop: 6, boxSizing: "border-box" }} /></label>
              <label>Shift<select value={shift} onChange={(e) => setShift(e.target.value)} style={{ width: "100%", padding: 12, marginTop: 6, background: "white" }}><option>PAGI</option><option>SIANG</option><option>MALAM</option></select></label>
              <label>Drop Point<input value="BGG16" readOnly style={{ width: "100%", padding: 12, marginTop: 6, boxSizing: "border-box", background: "#f3f4f6" }} /></label>
              <label>Nama Kurir / Sprinter<input required value={sprinter} onChange={(e) => setSprinter(e.target.value)} placeholder="Contoh: RIFAN" style={{ width: "100%", padding: 12, marginTop: 6, boxSizing: "border-box" }} /></label>
              <label style={{ gridColumn: "1 / -1" }}>Seller<input required value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="Nama seller" style={{ width: "100%", padding: 12, marginTop: 6, boxSizing: "border-box" }} /></label>
            </div>
            <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "#f9fafb" }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Preview kode</div>
              <strong>{preview}</strong>
            </div>
          </section>

          {error && <div role="alert" style={{ padding: 14, borderRadius: 10, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>{error}</div>}

          <button disabled={saving} type="submit" style={{ padding: "14px 18px", border: 0, borderRadius: 10, background: "#111827", color: "white", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Menyimpan..." : "Buat Manifest & Mulai Scan"}
          </button>
        </form>
      </div>
    </main>
  );
}
