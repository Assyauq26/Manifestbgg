"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

function sellerCode(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "XX";
}

export default function NewManifestPage() {
  const [seller, setSeller] = useState("ZR FASHION");
  const [date, setDate] = useState("2026-09-18");
  const [sequence, setSequence] = useState("001");
  const [awbs, setAwbs] = useState<string[]>([]);
  const [bulk, setBulk] = useState("");
  const code = useMemo(() => sellerCode(seller), [seller]);
  const manifestNumber = code + "-" + date.replaceAll("-", "") + "-" + sequence.padStart(3, "0");

  function addBulk() {
    const values = bulk.split(/[\n,\t ]+/).map((v) => v.trim()).filter(Boolean);
    const unique = Array.from(new Set([...awbs, ...values]));
    setAwbs(unique);
    setBulk("");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    alert("Draft manifest " + manifestNumber + " siap. Total AWB: " + awbs.length);
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/manifests" style={{ color: "#6b7280" }}>← Manifest</Link>
        <h1>Buat Manifest Retur</h1>
        <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
          <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label>Tanggal<input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={{ width: "100%", padding: 12, marginTop: 6 }} /></label>
              <label>Shift<select style={{ width: "100%", padding: 12, marginTop: 6, background: "white" }}><option>PAGI</option><option>SIANG</option><option>MALAM</option></select></label>
              <label>Drop Point<input value="BGG16" readOnly style={{ width: "100%", padding: 12, marginTop: 6, background: "#f3f4f6" }} /></label>
              <label>Sprinter<input placeholder="RIFAN" style={{ width: "100%", padding: 12, marginTop: 6 }} /></label>
              <label style={{ gridColumn: "1 / -1" }}>Seller<input value={seller} onChange={(e) => setSeller(e.target.value)} style={{ width: "100%", padding: 12, marginTop: 6 }} /></label>
              <label>Seller Code<input value={code} readOnly style={{ width: "100%", padding: 12, marginTop: 6, background: "#f3f4f6" }} /></label>
              <label>Sequence<input value={sequence} onChange={(e) => setSequence(e.target.value)} inputMode="numeric" style={{ width: "100%", padding: 12, marginTop: 6 }} /></label>
            </div>
            <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "#f9fafb" }}><strong>Manifest Number:</strong> {manifestNumber}</div>
          </section>

          <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Bulk AWB</h2>
            <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="Paste AWB, satu per baris..." rows={8} style={{ width: "100%", padding: 12, resize: "vertical" }} />
            <button type="button" onClick={addBulk} style={{ marginTop: 12, padding: "10px 14px", border: 0, borderRadius: 10, background: "#111827", color: "white" }}>Tambah AWB</button>
            <div style={{ marginTop: 18 }}><strong>{awbs.length}</strong> AWB</div>
            <ol>{awbs.slice(0, 20).map((awb) => <li key={awb}>{awb}</li>)}</ol>
            {awbs.length > 20 && <p>Menampilkan 20 pertama dari {awbs.length} AWB.</p>}
          </section>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" style={{ padding: "12px 18px", border: 0, borderRadius: 10, background: "#111827", color: "white", fontWeight: 700 }}>Simpan Draft</button>
            <Link href="/scan" style={{ display: "inline-flex", alignItems: "center", padding: "12px 18px", borderRadius: 10, border: "1px solid #d1d5db", textDecoration: "none", color: "#111827" }}>Lanjut Scan</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
