import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/google/appscript";
import { googleConfig } from "@/lib/google/config";

async function initializeGoogleSheets() {
  if (!googleConfig.appsScriptUrl) {
    return NextResponse.json({ ok: false, error: "GOOGLE_APPS_SCRIPT_URL is not configured." }, { status: 500 });
  }

  try {
    return NextResponse.json(await callAppsScript("schema"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Apps Script initialization failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return initializeGoogleSheets();
}

export async function POST() {
  return initializeGoogleSheets();
}
