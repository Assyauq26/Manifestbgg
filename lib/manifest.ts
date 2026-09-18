export function normalizeAwb(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
export function validateAwbFormat(awb: string): boolean {
  return /^[A-Z0-9-]{8,30}$/.test(awb);
}
export function sellerCodeFromName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "XX";
}
export function formatManifestNumber(sellerCode: string, date: string, sequence: number): string {
  const normalizedCode = sellerCode.trim().toUpperCase() || "XX";
  return normalizedCode + "-" + date.replace(/-/g, "") + "-" + String(sequence).padStart(3, "0");
}
