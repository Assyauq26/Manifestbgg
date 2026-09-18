import { getSheetsClient } from "./sheets";
import { googleConfig } from "./config";
import { ensureManifestSheets } from "./schema";
import { Manifest, ManifestItem, SHEET_HEADERS } from "@/types/domain";

function rowToObject<T extends Record<string, unknown>>(headers: readonly string[], row: string[]): T {
  return headers.reduce((obj, header, index) => {
    obj[header] = row[index] ?? "";
    return obj;
  }, {} as T);
}

function assertSpreadsheet() {
  if (!googleConfig.spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID is not configured.");
}

export async function listManifests(): Promise<Manifest[]> {
  assertSpreadsheet();
  await ensureManifestSheets();
  const client = getSheetsClient();
  const response = await client.spreadsheets.values.get({ spreadsheetId: googleConfig.spreadsheetId, range: "MANIFESTS!A2:U" });
  return (response.data.values ?? []).filter((row) => row[0]).map((row) => rowToObject<Manifest>(SHEET_HEADERS.MANIFESTS, row));
}

export async function findManifest(manifestId: string): Promise<Manifest | null> {
  const manifests = await listManifests();
  return manifests.find((item) => item.manifest_id === manifestId) ?? null;
}

export async function listManifestItems(manifestId: string): Promise<ManifestItem[]> {
  assertSpreadsheet();
  await ensureManifestSheets();
  const client = getSheetsClient();
  const response = await client.spreadsheets.values.get({ spreadsheetId: googleConfig.spreadsheetId, range: "MANIFEST_ITEMS!A2:H" });
  return (response.data.values ?? []).filter((row) => row[1] === manifestId).map((row) => rowToObject<ManifestItem>(SHEET_HEADERS.MANIFEST_ITEMS, row));
}

export async function appendManifest(manifest: Manifest): Promise<Manifest> {
  assertSpreadsheet();
  await ensureManifestSheets();
  const client = getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: googleConfig.spreadsheetId,
    range: "MANIFESTS!A:U",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[...SHEET_HEADERS.MANIFESTS].map((header) => String(manifest[header as keyof Manifest] ?? ""))] },
  });
  return manifest;
}

export async function appendManifestItem(item: ManifestItem): Promise<ManifestItem> {
  assertSpreadsheet();
  await ensureManifestSheets();
  const client = getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: googleConfig.spreadsheetId,
    range: "MANIFEST_ITEMS!A:H",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[...SHEET_HEADERS.MANIFEST_ITEMS].map((header) => String(item[header as keyof ManifestItem] ?? ""))] },
  });
  return item;
}

export async function updateManifestTotal(manifestId: string, totalAwb: number): Promise<void> {
  assertSpreadsheet();
  const manifests = await listManifests();
  const index = manifests.findIndex((item) => item.manifest_id === manifestId);
  if (index < 0) throw new Error("Manifest tidak ditemukan.");
  const client = getSheetsClient();
  const rowNumber = index + 2;
  await client.spreadsheets.values.batchUpdate({
    spreadsheetId: googleConfig.spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: `MANIFESTS!K${rowNumber}`, values: [[String(totalAwb)]] },
        { range: `MANIFESTS!O${rowNumber}`, values: [[new Date().toISOString()]] },
      ],
    },
  });
}

export async function nextManifestSequence(date: string, sellerCode: string): Promise<number> {
  const manifests = await listManifests();
  const prefix = `${sellerCode.toUpperCase()}-${date.replace(/-/g, "")}-`;
  const sequences = manifests
    .filter((manifest) => manifest.manifest_number.startsWith(prefix))
    .map((manifest) => Number(manifest.manifest_number.slice(prefix.length)))
    .filter((value) => Number.isInteger(value));
  return sequences.length ? Math.max(...sequences) + 1 : 1;
}

export function googleErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Google Sheets request failed.";
}
