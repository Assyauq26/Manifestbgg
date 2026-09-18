import { ExternalAccountClient, GoogleAuth } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";
import { googleConfig } from "./config";

function buildAudience() {
  return (
    "//iam.googleapis.com/projects/" +
    googleConfig.projectNumber +
    "/locations/global/workloadIdentityPools/" +
    googleConfig.workloadIdentityPoolId +
    "/providers/" +
    googleConfig.workloadIdentityPoolProviderId
  );
}

export function getGoogleAuth() {
  const audience = buildAudience();

  const externalAccount = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url:
      "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/" +
      googleConfig.serviceAccountEmail +
      ":generateAccessToken",
    subject_token_supplier: {
      getSubjectToken: () => getVercelOidcToken({ audience }),
    },
  });

  if (!externalAccount) {
    throw new Error("Failed to initialize Google external account client.");
  }

  return new GoogleAuth({ authClient: externalAccount });
}
