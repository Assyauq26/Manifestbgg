import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
import { googleConfig } from "./config";
export function getDriveClient() {
  return google.drive({ version: "v3", auth: getGoogleAuth() });
}
export function getManifestFolderId() {
  return googleConfig.driveFolderId;
}
