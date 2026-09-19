# Personal Google Drive OAuth

Manifest PDF storage now uses the connected personal Google Drive account instead of the Vercel/OIDC Service Account. Google documents that Service Accounts do not have Drive storage quota and recommends Shared Drives or OAuth on behalf of a human user for file storage.

## Required Vercel environment variables

```env
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=https://YOUR-DOMAIN/api/google/drive/callback
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_DRIVE_REFRESH_TOKEN=
```

The existing `GCP_*` and `GOOGLE_SPREADSHEET_ID` variables remain in use for Google Sheets.

## Google Cloud OAuth client

Create an OAuth 2.0 Client ID with application type **Web application**. Add the exact callback URL above to **Authorized redirect URIs**. The URI must match exactly, including scheme, host, path, and trailing slash rules.

For a private/internal operational app, add the Google account that owns the Drive folder as a test user if the OAuth consent screen is in testing mode.

## Connect the Drive account

After deploying with the OAuth client ID, secret, and redirect URI:

1. Open `/api/google/drive/authorize` on the deployed application.
2. Sign in with the personal Google account that owns or can edit `GOOGLE_DRIVE_FOLDER_ID`.
3. Approve Drive access.
4. The callback page displays a refresh token once.
5. Copy that value to Vercel as `GOOGLE_DRIVE_REFRESH_TOKEN`.
6. Redeploy.

The refresh token is a secret. Do not commit it to GitHub or place it in client-side code.

## Storage behavior

- Google Sheets continues to use the existing service-account/Vercel OIDC path.
- Manifest PDF upload/update/download uses the personal Google Drive OAuth credential.
- Existing PDF file IDs created by the old Service Account are handled during regeneration: the app tries to update the existing file and, if it is inaccessible to the personal account, creates a new user-owned PDF and updates the manifest metadata.
