import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
import { googleConfig } from "./config";

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getGoogleAuth() });
}

export function getManifestFolderId() {
  return googleConfig.driveFolderId;
}

export async function uploadManifestPdf(fileName: string, pdf: Buffer) {
  if (!googleConfig.driveFolderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured.");
  const drive = getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [googleConfig.driveFolderId],
      mimeType: "application/pdf",
    },
    media: { mimeType: "application/pdf", body: Buffer.from(pdf) },
    fields: "id,name,webViewLink,webContentLink",
  });
  const file = response.data;
  if (!file.id) throw new Error("Google Drive tidak mengembalikan file ID.");
  return {
    fileId: file.id,
    url: file.webViewLink ?? file.webContentLink ?? `https://drive.google.com/file/d/${file.id}/view`,
  };
}
