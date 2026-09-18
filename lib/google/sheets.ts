import { google } from "googleapis";
import { googleConfig } from "./config";
const auth = new google.auth.JWT({
  email: googleConfig.clientEmail,
  key: googleConfig.privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
export function getSheetsClient() {
  return google.sheets({ version: "v4", auth });
}
