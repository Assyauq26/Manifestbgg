import { googleConfig } from "./config";

export async function callAppsScript<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  if (!googleConfig.appsScriptUrl) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL is not configured.");
  }

  const response = await fetch(googleConfig.appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      apiKey: googleConfig.appsScriptApiKey,
      ...payload,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || `Apps Script request failed (${response.status}).`);
  }

  return data as T;
}
