import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeDriveCode } from "@/lib/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function html(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:760px;margin:auto;line-height:1.5"><h1>${title}</h1>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return html("Google Drive tidak terhubung", `<p>Google mengembalikan error: <code>${error}</code>.</p>`, 400);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_drive_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return html("OAuth state tidak valid", "<p>Permintaan OAuth ditolak. Silakan mulai lagi dari tombol Hubungkan Google Drive.</p>", 400);
  }

  try {
    const tokens = await exchangeDriveCode(code);
    cookieStore.delete("google_drive_oauth_state");

    if (!tokens.refresh_token) {
      return html(
        "Izin Google Drive diperoleh, tetapi refresh token tidak dikirim",
        "<p>Mulai ulang koneksi dengan prompt consent agar Google mengirim refresh token baru.</p>",
        400,
      );
    }

    const escapedToken = tokens.refresh_token.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    return html(
      "Google Drive berhasil terhubung",
      `<p>Salin refresh token berikut ke Vercel sebagai environment variable <strong>GOOGLE_DRIVE_REFRESH_TOKEN</strong>.</p><p><textarea readonly style="width:100%;min-height:120px;padding:12px;box-sizing:border-box">${escapedToken}</textarea></p><p><strong>Jangan bagikan token ini.</strong> Setelah disimpan di Vercel, redeploy aplikasi lalu kembali ke manifest dan coba Generate Manifest.</p>`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menukar authorization code.";
    return html("Google Drive gagal terhubung", `<p>${message}</p>`, 500);
  }
}
