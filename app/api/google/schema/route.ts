import { NextResponse } from "next/server";
import { ensureManifestSheets } from "@/lib/google/schema";

export async function POST() {
  try {
    return NextResponse.json(await ensureManifestSheets());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Sheets initialization failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
