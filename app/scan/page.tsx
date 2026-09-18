"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type DetectedCode = { rawValue?: string };
type Detector = { detect: (source: HTMLVideoElement) => Promise<DetectedCode[]> };

function ScanPageContent() {
  const params = useSearchParams();
  const manifestId = params.get("manifestId") ?? "";
  const manifestNumber = params.get("manifestNumber") ?? "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<Detector | null>(null);
  const busyRef = useRef(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [awb, setAwb] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    if (!manifestId) return;
    fetch(`/api/manifests/${encodeURIComponent(manifestId)}`)
      .then((res) => res.json())
      .then((data) => setItems((data.items ?? []).map((item: { awb: string }) => item.awb)))
      .catch(() => setError("Gagal memuat data manifest."));
  }, [manifestId]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser tidak mendukung akses kamera. Gunakan input AWB manual.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStarted(true);
      const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: new (options?: { formats?: string[] }) => Detector }).BarcodeDetector;
      if (BarcodeDetectorCtor) {
        detectorRef.current = new BarcodeDetectorCtor({ formats: ["code_128", "code_39", "ean_13", "ean_8", "qr_code", "data_matrix"] });
        requestAnimationFrame(scanFrame);
      } else {
        setCameraError("BarcodeDetector belum didukung browser ini. Kamera aktif, gunakan input AWB manual.");
      }
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : "Kamera tidak dapat diakses.");
    }
  }

  async function scanFrame() {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || !streamRef.current) return;
    if (!busyRef.current && video.readyState >= 2) {
      try {
        const codes = await detector.detect(video);
        const value = codes[0]?.rawValue?.trim();
        if (value) {
          busyRef.current = true;
          await submitAwb(value);
          window.setTimeout(() => { busyRef.current = false; }, 1000);
        }
      } catch {
        // Continue scanning when a frame cannot be decoded.
      }
    }
    if (streamRef.current) requestAnimationFrame(scanFrame);
  }

  async function submitAwb(value = awb) {
    setError("");
    setMessage("");
    if (!manifestId) {
      setError("Buat atau pilih manifest terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/manifest/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifestId, awb: value }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "AWB gagal disimpan.");
      setItems((current) => [...current, data.awb]);
      setAwb("");
      setMessage(`AWB ${data.awb} berhasil ditambahkan. Total ${data.totalAwb}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AWB gagal disimpan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#6b7280" }}>← Dashboard</Link>
        <div style={{ margin: "16px 0" }}>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>SCAN AWB • BGG16</p>
          <h1 style={{ margin: "6px 0" }}>Scan Paket Retur</h1>
          <strong>{manifestNumber || "Belum ada manifest"}</strong>
        </div>

        {!manifestId && <div style={{ padding: 14, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, marginBottom: 16 }}>Buka halaman ini melalui <Link href="/manifests/new">Buat Manifest</Link>.</div>}

        <section style={{ background: "#111827", borderRadius: 18, overflow: "hidden", position: "relative", minHeight: 420 }}>
          <video ref={videoRef} muted playsInline style={{ width: "100%", height: 420, objectFit: "cover", display: cameraStarted ? "block" : "none" }} />
          {!cameraStarted && <div style={{ minHeight: 420, display: "grid", placeItems: "center", padding: 24, color: "white", textAlign: "center" }}><div><div style={{ fontSize: 54 }}>▣</div><h2>Scan menggunakan kamera</h2><p style={{ opacity: 0.75 }}>Arahkan barcode AWB ke dalam kamera.</p><button onClick={startCamera} disabled={!manifestId} style={{ padding: "14px 18px", border: 0, borderRadius: 12, fontWeight: 800 }}>Aktifkan Kamera</button></div></div>}
          {cameraStarted && <div style={{ position: "absolute", left: "10%", right: "10%", top: "35%", height: 100, border: "2px solid white", borderRadius: 14, pointerEvents: "none" }} />}
        </section>

        {cameraError && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fff7ed", color: "#9a3412" }}>{cameraError}</div>}
        {message && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f0fdf4", color: "#166534" }}>{message}</div>}
        {error && <div role="alert" style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fef2f2", color: "#991b1b" }}>{error}</div>}

        <section style={{ marginTop: 16, background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
          <label style={{ fontWeight: 700 }}>Input AWB manual</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={awb} onChange={(e) => setAwb(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitAwb()} placeholder="Ketik / paste AWB" style={{ flex: 1, minWidth: 0, padding: 13, border: "1px solid #d1d5db", borderRadius: 10 }} />
            <button onClick={() => submitAwb()} disabled={loading || !awb} style={{ padding: "12px 14px", border: 0, borderRadius: 10, background: "#111827", color: "white", fontWeight: 700 }}>Tambah</button>
          </div>
        </section>

        <section style={{ marginTop: 16, background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong>AWB Terscan</strong><strong>{items.length}</strong></div>
          <ol style={{ paddingLeft: 24, maxHeight: 260, overflow: "auto" }}>{items.map((item, index) => <li key={`${item}-${index}`} style={{ padding: "5px 0" }}>{item}</li>)}</ol>
        </section>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", padding: 16 }}><div style={{ maxWidth: 760, margin: "0 auto" }}>Memuat scanner...</div></main>}>
      <ScanPageContent />
    </Suspense>
  );
}
