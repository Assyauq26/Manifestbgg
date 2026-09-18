"use client";

import { useState } from "react";
import Link from "next/link";

export default function ScanPage() {
  const [cameraStarted, setCameraStarted] = useState(false);
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#6b7280" }}>← Dashboard</Link>
        <h1 style={{ marginBottom: 8 }}>Scan AWB</h1>
        <p style={{ color: "#6b7280" }}>Scanner kamera akan diaktifkan pada tahap integrasi barcode/QR.</p>
        <section style={{ marginTop: 24, background: "#111827", color: "white", borderRadius: 18, minHeight: 520, display: "grid", placeItems: "center", padding: 24 }}>
          {!cameraStarted ? (
            <button onClick={() => setCameraStarted(true)} style={{ padding: "14px 18px", border: 0, borderRadius: 12, background: "white", color: "#111827", fontWeight: 800 }}>Aktifkan Kamera</button>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 280, height: 180, border: "2px solid white", borderRadius: 16, marginBottom: 20 }} />
              <strong>Camera scanner foundation aktif</strong>
              <div style={{ marginTop: 8, opacity: 0.75 }}>ZXing akan diintegrasikan setelah Google Sheets foundation siap.</div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
