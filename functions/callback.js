// functions/callback.js
// Handles Discord OAuth callback: exchange code → fetch user → set session cookie → redirect.

import { COOKIE_SESSION, setCookie, createSession } from "./_utils";
// If you're storing users in D1, uncomment the next line and ensure functions/_db.js exists.
// import { upsertUser } from "./_db";

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

  // Optional: persist/update user in D1
  // try { await upsertUser(env, user); } catch (_) {}

  // 3) Create session + cookie
  const sessionToken = await createSession(user, env.SESSION_SECRET);

  // Important: cookie must be available site-wide and work in local HTTP
  const isHttps = url.protocol === "https:";
  const sessCookie = setCookie(COOKIE_SESSION, sessionToken, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: isHttps,          // false on local wrangler (http)
    path: "/",                // make it visible to /me, /
    sameSite: "Lax",          // good default for OAuth redirects
    httpOnly: true            // your setCookie may set this by default; safe to include
  });

  // 4) Redirect home (change to "/profile.html" if you prefer)
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": sessCookie,
      "Location": "/"
    }
  });
}
