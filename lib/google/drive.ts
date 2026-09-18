import { google } from "googleapis";
import { googleConfig } from "./config";

const auth = new google.auth.JWT({
  email: googleConfig.clientEmail,
  key: googleConfig.privateKey,
  scopes: ["https://www.googleapis.com/auth/drive.file"]
});

export function getDriveClient() {
  return google.drive({ version: "v3", auth });
}

export function getManifestFolderId() {
  return googleConfig.driveFolderId;
}
