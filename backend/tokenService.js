import fetch from "node-fetch";

let cachedToken = null;
let tokenExpiry = null;

export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
}

export async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const body = new URLSearchParams({
    client_id: process.env.PM_CLIENT_ID,
    client_secret: process.env.PM_CLIENT_SECRET,
    grant_type: process.env.PM_GRANT_TYPE,
  });

  console.log("Fetching token with:", { client_id: process.env.PM_CLIENT_ID, grant_type: process.env.PM_GRANT_TYPE, token_url: process.env.PM_TOKEN_URL });

  const res = await fetch(process.env.PM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Ocp-Apim-Subscription-Key": process.env.PM_SUBSCRIPTION_KEY,
    },
    body,
  });

  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}
