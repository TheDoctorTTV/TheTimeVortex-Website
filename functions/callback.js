// functions/callback.js
// Handles Discord OAuth callback: exchange code → fetch user → set session cookie → redirect.

import { COOKIE_SESSION, setCookie, createSession } from "./_utils";
// If you're storing users in D1, uncomment the next line and ensure functions/_db.js exists.
import { upsertUser } from "./_db";
import { syncRolesAndBadges } from "./_discord";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("No code provided", { status: 400 });

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

  // in callback.js after fetching user
  if (env.DB) {
    try { await upsertUser(env, user); } catch (_) { }
    try { await syncRolesAndBadges(env, user.id); } catch (_) { }
  }


  // Optional: persist/update user in D1
  // try { await upsertUser(env, user); } catch (_) {}

  // 3) Create session + cookie
  const sessionToken = await createSession(user, env.SESSION_SECRET);

  const isHttps = new URL(request.url).protocol === "https:";

  // Build cookie manually so we guarantee Path=/ and SameSite=Lax
  const cookie = [
    `${COOKIE_SESSION}=${sessionToken}`,
    "Path=/",          // <-- visible to /, /me, etc.
    "HttpOnly",        // JS can't read it (good)
    "SameSite=Lax",    // allows OAuth top-level redirect
    isHttps ? "Secure" : "" // Secure only on https
  ].filter(Boolean).join("; ");

  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": cookie,
      "Location": "/"     // or "/profile.html"
    }
  });
}
