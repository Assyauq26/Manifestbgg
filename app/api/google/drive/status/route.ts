import { NextResponse } from "next/server";
import { googleConfig } from "@/lib/google/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    connected: Boolean(
      googleConfig.oauthClientId &&
      googleConfig.oauthClientSecret &&
      googleConfig.oauthRedirectUri &&
      googleConfig.driveRefreshToken,
    ),
  });
}
