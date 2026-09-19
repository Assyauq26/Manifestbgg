import { ActivityLog, Manifest, ManifestItem, ManifestStatus, SHEET_HEADERS } from "@/types/domain";
import { callAppsScript } from "./appscript";

export async function listManifests(): Promise<Manifest[]> {
  const response = await callAppsScript<{ manifests: Manifest[] }>("listManifests");
  return response.manifests ?? [];
}

export async function findManifest(manifestId: string): Promise<Manifest | null> {
  const manifests = await listManifests();
  return manifests.find((item) => item.manifest_id === manifestId) ?? null;
}

export async function listManifestItems(manifestId: string): Promise<ManifestItem[]> {
  const response = await callAppsScript<{ items: ManifestItem[] }>("listManifestItems", { manifestId });
  return (response.items ?? []).sort((a, b) => Number(a.sequence) - Number(b.sequence));
}

export async function appendManifest(manifest: Manifest): Promise<Manifest> {
  await callAppsScript("appendManifest", { manifest });
  return manifest;
}

export async function appendManifestItem(item: ManifestItem): Promise<ManifestItem> {
  await callAppsScript("appendManifestItem", { item });
  return item;
}

export async function updateManifestTotal(manifestId: string, totalAwb: number): Promise<void> {
  await callAppsScript("updateManifestTotal", { manifestId, totalAwb });
}

export async function updateManifestPdf(manifestId: string, fileId: string, url: string): Promise<void> {
  await callAppsScript("updateManifestPdf", { manifestId, fileId, url });
}

export async function updateManifestStatus(
  manifestId: string,
  status: ManifestStatus,
  fields: Partial<Pick<Manifest, "handed_over_at" | "received_by" | "received_phone" | "notes">> = {},
): Promise<Manifest> {
  const manifest = await findManifest(manifestId);
  if (!manifest) throw new Error("Manifest tidak ditemukan.");
  const now = new Date().toISOString();
  await callAppsScript("updateManifestStatus", {
    manifestId,
    status,
    handedOverAt: fields.handed_over_at,
    receivedBy: fields.received_by,
    receivedPhone: fields.received_phone,
    notes: fields.notes,
  });
  return { ...manifest, ...fields, status, updated_at: now };
}

export async function appendActivityLog(log: ActivityLog): Promise<ActivityLog> {
  await callAppsScript("appendActivityLog", { log });
  return log;
}

export async function nextManifestSequence(date: string, sellerCode: string): Promise<number> {
  const response = await callAppsScript<{ sequence: number }>("nextManifestSequence", { date, sellerCode });
  return Number(response.sequence || 1);
}

export function googleErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Google Apps Script request failed.";
}

export function manifestHeaders() {
  return SHEET_HEADERS.MANIFESTS;
}
