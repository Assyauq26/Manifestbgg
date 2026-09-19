export const googleConfig = {
  projectId: process.env.GCP_PROJECT_ID ?? "",
  projectNumber: process.env.GCP_PROJECT_NUMBER ?? "",
  serviceAccountEmail: process.env.GCP_SERVICE_ACCOUNT_EMAIL ?? "",
  workloadIdentityPoolId: process.env.GCP_WORKLOAD_IDENTITY_POOL_ID ?? "",
  workloadIdentityPoolProviderId: process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID ?? "",
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID ?? "",
  driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? "",
  oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
  oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
  oauthRedirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "",
  driveRefreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN ?? "",
};
