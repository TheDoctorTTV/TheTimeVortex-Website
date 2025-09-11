// functions/callback.js
// Handles Discord OAuth callback: exchange code → fetch user → set session cookie → redirect.

import { COOKIE_SESSION, COOKIE_STATE, createSession, parseCookies, setCookie } from "./_utils.js";
import { ensureUser } from "./_session.js";
import { syncRolesAndBadges } from "./_discord.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(request);
  if (!code || !state || state !== cookies[COOKIE_STATE]) {
    const headers = new Headers({ "content-type": "text/plain" });
    headers.append("Set-Cookie", setCookie(COOKIE_STATE, "", { maxAge: 0 }));
    return new Response("Invalid state", { status: 400, headers });
  }

  const clearState = setCookie(COOKIE_STATE, "", { maxAge: 0, path: "/" });

  // Must exactly match what login.js used (same scheme + host)
  const redirectUri = `${url.protocol}//${url.host}/callback`;

  // 1) Exchange code for tokens
  const tokenBody = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: tokenBody,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return new Response(`Token exchange failed: ${err}`, { status: 400 });
  }

  const tokens = await tokenRes.json();

  // 2) Fetch the Discord user
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    return new Response(`Failed to fetch user: ${err}`, { status: 400 });
  }

  const user = await userRes.json();

  if (env.DB) {
    try { await ensureUser(env, user); } catch (_) {}
    try { await syncRolesAndBadges(env, user.id); } catch (_) {}
  }

  // 3) Create session + cookie
  const sessionToken = await createSession(user, env.SESSION_SECRET);

  const isHttps = new URL(request.url).protocol === "https:";

  // Build cookie manually so we guarantee Path=/ and SameSite=Lax
  const cookie = [
    `${COOKIE_SESSION}=${sessionToken}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : ""
  ].filter(Boolean).join("; ");

  const headers = new Headers({ "Location": "/" });
  headers.append("Set-Cookie", cookie);
  headers.append("Set-Cookie", clearState);

  return new Response(null, {
    status: 302,
    headers
  });
}
