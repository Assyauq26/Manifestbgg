import { NextResponse } from "next/server";
import { ensureManifestSheets } from "@/lib/google/schema";
import { assertGoogleConfig } from "@/lib/google/config";

export async function POST() {
  try {
    assertGoogleConfig();
    return NextResponse.json(await ensureManifestSheets());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Sheets initialization failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
