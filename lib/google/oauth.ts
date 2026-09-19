import { google } from "googleapis";
import { googleConfig } from "./config";

export const GOOGLE_DRIVE_OAUTH_SCOPE = "https://www.googleapis.com/auth/drive";

function assertOAuthConfig() {
  if (!googleConfig.oauthClientId) throw new Error("GOOGLE_OAUTH_CLIENT_ID is not configured.");
  if (!googleConfig.oauthClientSecret) throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is not configured.");
  if (!googleConfig.oauthRedirectUri) throw new Error("GOOGLE_OAUTH_REDIRECT_URI is not configured.");
}

export function getGoogleOAuthClient() {
  assertOAuthConfig();
  return new google.auth.OAuth2(
    googleConfig.oauthClientId,
    googleConfig.oauthClientSecret,
    googleConfig.oauthRedirectUri,
  );
}

export function getDriveAuthorizationUrl(state: string) {
  const client = getGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: [GOOGLE_DRIVE_OAUTH_SCOPE],
    state,
  });
}

export async function exchangeDriveCode(code: string) {
  const client = getGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export function getPersonalDriveClient() {
  if (!googleConfig.driveRefreshToken) {
    throw new Error(
      "Google Drive belum terhubung. Hubungkan akun Google terlebih dahulu melalui /api/google/drive/authorize, lalu simpan refresh token sebagai GOOGLE_DRIVE_REFRESH_TOKEN di Vercel.",
    );
  }

  const client = getGoogleOAuthClient();
  client.setCredentials({ refresh_token: googleConfig.driveRefreshToken });
  return google.drive({ version: "v3", auth: client });
}
