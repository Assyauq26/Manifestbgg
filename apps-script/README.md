# Manifest BGG16 — Google Apps Script Backend

Apps Script replaces direct Google OAuth / service-account access from Vercel. The Apps Script project executes as the personal Google account that owns the script, so Sheets and Drive are accessed with that account's permissions.

## 1. Create the Apps Script

1. Open `script.google.com` with the personal Google account that owns the Manifest spreadsheet and Drive folder.
2. Create a new standalone Apps Script project.
3. Copy `Code.gs` from this directory into the Apps Script editor.

## 2. Configure Script Properties

In **Project Settings → Script properties**, add:

- `SPREADSHEET_ID` — the ID from the Google Sheet URL.
- `DRIVE_FOLDER_ID` — the ID of the Drive folder where PDFs and handover photos will be stored.
- `API_KEY` — a long random secret shared only with the Vercel environment variable `GOOGLE_APPS_SCRIPT_API_KEY`.

Do not commit these values to GitHub.

## 3. Deploy as Web App

Deploy → New deployment → Web app.

- Execute as: **Me**
- Who has access: **Anyone**

Copy the resulting `/exec` URL into Vercel as `GOOGLE_APPS_SCRIPT_URL`.

## 4. Initialize the spreadsheet

Open:

`https://YOUR-VERCEL-DOMAIN/api/google/schema`

The endpoint calls Apps Script and creates/updates these headers:

- CONFIG
- SELLERS
- SPRINTERS
- USERS
- MANIFESTS
- MANIFEST_ITEMS
- LOGS

`MANIFESTS` includes `handover_photo_file_id` and `handover_photo_url` for the single handover photo.

## 5. Vercel environment variables

Required:

```text
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_APPS_SCRIPT_API_KEY=your-secret-key
GOOGLE_SPREADSHEET_ID=your-sheet-id
```

The spreadsheet ID is retained as application configuration, but Apps Script is the component that actually opens the spreadsheet and Drive folder.

## 6. Operational flow

Vercel → Apps Script → Google Sheets / Google Drive.

PDF generation remains in the Next.js application using the existing official manifest template. The generated PDF is sent to Apps Script as base64 and Apps Script saves it into the configured personal Drive folder.

The same `uploadFile` action can be used for the single handover photo captured at the **Serah Terima** stage.
