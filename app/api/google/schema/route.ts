import { NextResponse } from "next/server";
import { ensureManifestSheets } from "@/lib/google/schema";
import { googleConfig } from "@/lib/google/config";

async function initializeGoogleSheets() {
  const missing: string[] = [];
  if (!googleConfig.projectId) missing.push("GCP_PROJECT_ID");
  if (!googleConfig.projectNumber) missing.push("GCP_PROJECT_NUMBER");
  if (!googleConfig.serviceAccountEmail) missing.push("GCP_SERVICE_ACCOUNT_EMAIL");
  if (!googleConfig.workloadIdentityPoolId) missing.push("GCP_WORKLOAD_IDENTITY_POOL_ID");
  if (!googleConfig.workloadIdentityPoolProviderId) missing.push("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");
  if (!googleConfig.spreadsheetId) missing.push("GOOGLE_SPREADSHEET_ID");
  if (!googleConfig.driveFolderId) missing.push("GOOGLE_DRIVE_FOLDER_ID");

  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: "Missing environment variables", missing },
      { status: 500 }
    );
  }

  try {
    return NextResponse.json(await ensureManifestSheets());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Sheets initialization failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return initializeGoogleSheets();
}

export async function POST() {
  return initializeGoogleSheets();
}
