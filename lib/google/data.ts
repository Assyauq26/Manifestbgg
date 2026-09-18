import { getSheetsClient } from "./sheets";
import { googleConfig } from "./config";
import { ActivityLog, Manifest, ManifestItem, ManifestStatus, SHEET_HEADERS } from "@/types/domain";

function rowToObject<T>(headers: readonly string[], row: string[]): T {
  const obj: Record<string, string> = {};
  headers.forEach((header, index) => { obj[header] = row[index] ?? ""; });
  return obj as T;
}

function assertSpreadsheet() {
  if (!googleConfig.spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID is not configured.");
}

async function getClient() {
  assertSpreadsheet();
  return getSheetsClient();
}

export async function listManifests(): Promise<Manifest[]> {
  const client = await getClient();
  const response = await client.spreadsheets.values.get({ spreadsheetId: googleConfig.spreadsheetId, range: "MANIFESTS!A2:U" });
  return (response.data.values ?? []).filter((row) => row[0]).map((row) => rowToObject<Manifest>(SHEET_HEADERS.MANIFESTS, row));
}

export async function findManifest(manifestId: string): Promise<Manifest | null> {
  const manifests = await listManifests();
  return manifests.find((item) => item.manifest_id === manifestId) ?? null;
}

export async function listManifestItems(manifestId: string): Promise<ManifestItem[]> {
  const client = await getClient();
  const response = await client.spreadsheets.values.get({ spreadsheetId: googleConfig.spreadsheetId, range: "MANIFEST_ITEMS!A2:H" });
  return (response.data.values ?? [])
    .filter((row) => row[1] === manifestId)
    .map((row) => rowToObject<ManifestItem>(SHEET_HEADERS.MANIFEST_ITEMS, row))
    .sort((a, b) => a.sequence - b.sequence);
}

export async function appendManifest(manifest: Manifest): Promise<Manifest> {
  const client = await getClient();
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
  const client = await getClient();
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

export async function updateManifestPdf(manifestId: string, fileId: string, url: string): Promise<void> {
  const manifests = await listManifests();
  const index = manifests.findIndex((item) => item.manifest_id === manifestId);
  if (index < 0) throw new Error("Manifest tidak ditemukan.");
  const rowNumber = index + 2;
  const client = getSheetsClient();
  await client.spreadsheets.values.batchUpdate({
    spreadsheetId: googleConfig.spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: `MANIFESTS!T${rowNumber}`, values: [[fileId]] },
        { range: `MANIFESTS!U${rowNumber}`, values: [[url]] },
        { range: `MANIFESTS!O${rowNumber}`, values: [[new Date().toISOString()]] },
      ],
    },
  });
}

export async function updateManifestStatus(
  manifestId: string,
  status: ManifestStatus,
  fields: Partial<Pick<Manifest, "handed_over_at" | "received_by" | "received_phone" | "notes">> = {},
): Promise<Manifest> {
  const manifests = await listManifests();
  const index = manifests.findIndex((item) => item.manifest_id === manifestId);
  if (index < 0) throw new Error("Manifest tidak ditemukan.");

  const manifest = manifests[index];
  const client = getSheetsClient();
  const rowNumber = index + 2;
  const now = new Date().toISOString();
  const data: Array<{ range: string; values: string[][] }> = [
    { range: `MANIFESTS!L${rowNumber}`, values: [[status]] },
    { range: `MANIFESTS!O${rowNumber}`, values: [[now]] },
  ];

  if (fields.handed_over_at !== undefined) data.push({ range: `MANIFESTS!P${rowNumber}`, values: [[fields.handed_over_at]] });
  if (fields.received_by !== undefined) data.push({ range: `MANIFESTS!Q${rowNumber}`, values: [[fields.received_by]] });
  if (fields.received_phone !== undefined) data.push({ range: `MANIFESTS!R${rowNumber}`, values: [[fields.received_phone]] });
  if (fields.notes !== undefined) data.push({ range: `MANIFESTS!S${rowNumber}`, values: [[fields.notes]] });

  await client.spreadsheets.values.batchUpdate({
    spreadsheetId: googleConfig.spreadsheetId,
    requestBody: { valueInputOption: "RAW", data },
  });

  return { ...manifest, ...fields, status, updated_at: now };
}

export async function appendActivityLog(log: ActivityLog): Promise<ActivityLog> {
  const client = await getClient();
  await client.spreadsheets.values.append({
    spreadsheetId: googleConfig.spreadsheetId,
    range: "LOGS!A:J",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[...SHEET_HEADERS.LOGS].map((header) => String(log[header as keyof ActivityLog] ?? ""))] },
  });
  return log;
}

export async function nextManifestSequence(date: string, sellerCode: string): Promise<number> {
  const manifests = await listManifests();
  const prefix = `${sellerCode.toUpperCase()}-${date.replace(/-/g, "")}-`;
  const sequences = manifests
    .filter((manifest) => manifest.manifest_number.startsWith(prefix))
    .map((manifest) => Number(manifest.manifest_number.slice(prefix.length)))
    .filter((value) => Number.isInteger(value) && value > 0);
  return sequences.length ? Math.max(...sequences) + 1 : 1;
}

export function googleErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Google Sheets request failed.";
}
