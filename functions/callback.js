// functions/callback.js
// Exchanges the OAuth "code" for tokens, fetches the Discord user,
// sets the session cookie, and redirects home.

import { COOKIE_SESSION, setCookie, createSession } from "./_utils";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("No code provided", { status: 400 });

  // Build redirectUri to match what login.js used (dynamic host)
  const redirectUri = `${url.protocol}//${url.host}/callback`;

  // 1) Exchange code for tokens
  const body = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body,
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

  const user = await userRes.json(); // { id, username, global_name, avatar, email? ... }

  // 3) Create session + cookie
  const sessionToken = await createSession(user, env.SESSION_SECRET);

  // Secure cookie only on https (local wrangler runs on http)
  const isHttps = url.protocol === "https:";
  const sessCookie = setCookie(COOKIE_SESSION, sessionToken, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: isHttps,
  });

  // 4) Redirect home (or "/profile" if you prefer)
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": sessCookie,
      "Location": "/",
    },
  });
}
