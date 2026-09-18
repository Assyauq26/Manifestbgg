import { getSheetsClient } from "./sheets";
import { googleConfig } from "./config";
import { SHEET_HEADERS } from "@/types/domain";

const sheets = Object.keys(SHEET_HEADERS) as Array<keyof typeof SHEET_HEADERS>;

export async function ensureManifestSheets() {
  const client = getSheetsClient();
  const metadata = await client.spreadsheets.get({
    spreadsheetId: googleConfig.spreadsheetId,
    fields: "sheets.properties.title"
  });

  const existing = new Set(
    (metadata.data.sheets ?? [])
      .map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title))
  );

  const missing = sheets
    .filter((title) => !existing.has(title))
    .map((title) => ({ addSheet: { properties: { title } } }));

  if (missing.length) {
    await client.spreadsheets.batchUpdate({
      spreadsheetId: googleConfig.spreadsheetId,
      requestBody: { requests: missing }
    });
  }

  for (const title of sheets) {
    const headers = SHEET_HEADERS[title];
    await client.spreadsheets.values.update({
      spreadsheetId: googleConfig.spreadsheetId,
      range: title + "!A1:" + column(headers.length) + "1",
      valueInputOption: "RAW",
      requestBody: { values: [Array.from(headers)] }
    });
  }

  return { ok: true, sheets };
}

function column(value: number) {
  let result = "";
  let n = value;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}
