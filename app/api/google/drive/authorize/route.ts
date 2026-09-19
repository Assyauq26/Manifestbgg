import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getDriveAuthorizationUrl } from "@/lib/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = randomBytes(32).toString("hex");
    const authorizationUrl = getDriveAuthorizationUrl(state);
    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set("google_drive_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/google/drive/callback",
      maxAge: 600,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memulai koneksi Google Drive.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
