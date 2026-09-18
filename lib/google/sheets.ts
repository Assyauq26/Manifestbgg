import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getGoogleAuth() });
}
