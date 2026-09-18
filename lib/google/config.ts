function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing server environment variable: " + name);
  return value;
}
export const googleConfig = {
  projectId: required("GOOGLE_PROJECT_ID"),
  clientEmail: required("GOOGLE_CLIENT_EMAIL"),
  privateKey: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  spreadsheetId: required("GOOGLE_SPREADSHEET_ID"),
  driveFolderId: required("GOOGLE_DRIVE_FOLDER_ID")
};
