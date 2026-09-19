/**
 * Manifest BGG16 - Google Apps Script backend
 *
 * Deploy as Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Configure Script Properties:
 *   SPREADSHEET_ID = your Google Spreadsheet ID
 *   DRIVE_FOLDER_ID = your Google Drive folder ID
 *   API_KEY = a private random string shared with Vercel
 */

const SHEET_HEADERS = {
  CONFIG: ['key', 'value', 'description'],
  SELLERS: ['seller_id', 'seller_code', 'seller_name', 'pic_name', 'pic_phone', 'address', 'status', 'created_at', 'updated_at'],
  SPRINTERS: ['sprinter_id', 'employee_code', 'name', 'phone', 'drop_point', 'status', 'created_at', 'updated_at'],
  USERS: ['user_id', 'name', 'email', 'role', 'drop_point', 'status', 'created_at'],
  MANIFESTS: ['manifest_id', 'manifest_number', 'manifest_date', 'shift', 'drop_point', 'sprinter_id', 'seller_id', 'seller_code', 'pic_name', 'pic_phone', 'total_awb', 'status', 'created_by', 'created_at', 'updated_at', 'handed_over_at', 'received_by', 'received_phone', 'notes', 'pdf_file_id', 'pdf_url', 'handover_photo_file_id', 'handover_photo_url'],
  MANIFEST_ITEMS: ['item_id', 'manifest_id', 'sequence', 'awb', 'status', 'scanned_at', 'scanned_by', 'created_at'],
  LOGS: ['log_id', 'timestamp', 'user_id', 'action', 'manifest_id', 'awb', 'old_value', 'new_value', 'description', 'device']
};

function doGet(e) {
  try {
    return json_(dispatch_(e && e.parameter ? e.parameter : {}));
  } catch (err) {
    return json_({ ok: false, error: errorMessage_(err) });
  }
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    return json_(dispatch_(body));
  } catch (err) {
    return json_({ ok: false, error: errorMessage_(err) });
  }
}

function dispatch_(request) {
  authorize_(request);
  const action = String(request.action || '').trim();
  switch (action) {
    case 'health': return { ok: true, service: 'manifestbgg-appscript', timestamp: new Date().toISOString() };
    case 'schema': return ensureSchema_();
    case 'listManifests': return { ok: true, manifests: listObjects_('MANIFESTS') };
    case 'listManifestItems': return { ok: true, items: listManifestItems_(String(request.manifestId || '')) };
    case 'appendManifest': return appendObject_('MANIFESTS', request.manifest);
    case 'appendManifestItem': return appendObject_('MANIFEST_ITEMS', request.item);
    case 'updateManifestTotal': return updateManifestTotal_(String(request.manifestId || ''), Number(request.totalAwb || 0));
    case 'updateManifestPdf': return updateManifestPdf_(String(request.manifestId || ''), String(request.fileId || ''), String(request.url || ''));
    case 'updateManifestStatus': return updateManifestStatus_(request);
    case 'appendActivityLog': return appendObject_('LOGS', request.log);
    case 'nextManifestSequence': return { ok: true, sequence: nextManifestSequence_(String(request.date || ''), String(request.sellerCode || '')) };
    case 'uploadFile': return uploadFile_(request);
    default: throw new Error('Unknown action: ' + action);
  }
}

function authorize_(request) {
  const configured = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (configured && String(request.apiKey || '') !== configured) throw new Error('Unauthorized.');
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  const raw = e.postData.contents;
  try { return JSON.parse(raw); } catch (_) {}
  const params = e.parameter || {};
  return params;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID is not configured in Script Properties.');
  return SpreadsheetApp.openById(id);
}

function ensureSchema_() {
  const ss = spreadsheet_();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    Object.keys(SHEET_HEADERS).forEach(function(name) {
      let sheet = ss.getSheetByName(name);
      if (!sheet) sheet = ss.insertSheet(name);
      const headers = SHEET_HEADERS[name];
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      } else {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      sheet.setFrozenRows(1);
    });
    return { ok: true, sheets: Object.keys(SHEET_HEADERS) };
  } finally {
    lock.releaseLock();
  }
}

function listObjects_(sheetName) {
  const sheet = spreadsheet_().getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const headers = SHEET_HEADERS[sheetName];
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
  return values.filter(function(row) { return row[0]; }).map(function(row) { return rowToObject_(headers, row); });
}

function listManifestItems_(manifestId) {
  return listObjects_('MANIFEST_ITEMS')
    .filter(function(item) { return item.manifest_id === manifestId; })
    .sort(function(a, b) { return Number(a.sequence || 0) - Number(b.sequence || 0); });
}

function appendObject_(sheetName, object) {
  if (!object) throw new Error('Missing object for ' + sheetName + '.');
  const sheet = spreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan. Jalankan schema terlebih dahulu.');
  const headers = SHEET_HEADERS[sheetName];
  const row = headers.map(function(header) { return object[header] === undefined || object[header] === null ? '' : String(object[header]); });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { sheet.appendRow(row); } finally { lock.releaseLock(); }
  return { ok: true, object: object };
}

function updateManifestTotal_(manifestId, totalAwb) {
  const result = findManifestRow_(manifestId);
  const sheet = result.sheet;
  const row = result.row;
  const now = new Date().toISOString();
  sheet.getRange(row, 11).setValue(String(totalAwb));
  sheet.getRange(row, 15).setValue(now);
  return { ok: true };
}

function updateManifestPdf_(manifestId, fileId, url) {
  const result = findManifestRow_(manifestId);
  result.sheet.getRange(result.row, 20, 1, 2).setValues([[fileId, url]]);
  result.sheet.getRange(result.row, 15).setValue(new Date().toISOString());
  return { ok: true };
}

function updateManifestStatus_(request) {
  const result = findManifestRow_(String(request.manifestId || ''));
  const sheet = result.sheet;
  const row = result.row;
  const status = String(request.status || '');
  const now = new Date().toISOString();
  sheet.getRange(row, 12).setValue(status);
  sheet.getRange(row, 15).setValue(now);
  if (request.handedOverAt !== undefined) sheet.getRange(row, 16).setValue(request.handedOverAt || '');
  if (request.receivedBy !== undefined) sheet.getRange(row, 17).setValue(request.receivedBy || '');
  if (request.receivedPhone !== undefined) sheet.getRange(row, 18).setValue(request.receivedPhone || '');
  if (request.notes !== undefined) sheet.getRange(row, 19).setValue(request.notes || '');
  return { ok: true };
}

function nextManifestSequence_(date, sellerCode) {
  const prefix = String(sellerCode).toUpperCase() + '-' + String(date).replace(/-/g, '') + '-';
  const manifests = listObjects_('MANIFESTS');
  let max = 0;
  manifests.forEach(function(manifest) {
    const number = String(manifest.manifest_number || '');
    if (number.indexOf(prefix) !== 0) return;
    const value = Number(number.slice(prefix.length));
    if (Number.isInteger(value) && value > max) max = value;
  });
  return max + 1;
}

function findManifestRow_(manifestId) {
  const sheet = spreadsheet_().getSheetByName('MANIFESTS');
  if (!sheet) throw new Error('Sheet MANIFESTS tidak ditemukan.');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Manifest tidak ditemukan.');
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === manifestId) return { sheet: sheet, row: i + 2 };
  }
  throw new Error('Manifest tidak ditemukan.');
}

function uploadFile_(request) {
  const folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (!folderId) throw new Error('DRIVE_FOLDER_ID is not configured in Script Properties.');
  const base64 = String(request.base64 || '');
  if (!base64) throw new Error('File base64 wajib diisi.');
  const mimeType = String(request.mimeType || 'application/octet-stream');
  const fileName = String(request.fileName || ('manifest-' + Date.now()));
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = DriveApp.getFolderById(folderId).createFile(blob);
  return {
    ok: true,
    fileId: file.getId(),
    fileName: file.getName(),
    url: file.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId()
  };
}

function rowToObject_(headers, row) {
  const object = {};
  headers.forEach(function(header, index) { object[header] = row[index] || ''; });
  return object;
}

function errorMessage_(err) {
  return err && err.message ? err.message : String(err);
}
