import { callAppsScript } from "./appscript";

export async function uploadManifestPdf(fileName: string, pdf: Buffer) {
  const base64 = pdf.toString("base64");
  const response = await callAppsScript<{ fileId: string; url: string; downloadUrl?: string }>("uploadFile", {
    fileName,
    mimeType: "application/pdf",
    base64,
  });
  if (!response.fileId) throw new Error("Google Drive tidak mengembalikan file ID.");
  return {
    fileId: response.fileId,
    url: response.url || response.downloadUrl || `https://drive.google.com/file/d/${response.fileId}/view`,
  };
}

export function getManifestFolderId() {
  return "managed-by-apps-script";
}
