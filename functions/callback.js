import { COOKIE_STATE, COOKIE_SESSION, parseCookies, setCookie, redirect, createSession } from "./_utils";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(request);

  if (!code || !state || cookies[COOKIE_STATE] !== state) {
    return new Response("Invalid state or code", { status: 400 });
  }

  const clearState = `${COOKIE_STATE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

  const body = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: `${env.BASE_URL}/callback`
  });

  const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!tokenResp.ok) {
    const t = await tokenResp.text();
    return new Response(`Token exchange failed: ${t}`, { status: 502 });
  }
  const tokens = await tokenResp.json();

  const meResp = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  if (!meResp.ok) {
    const t = await meResp.text();
    return new Response(`User fetch failed: ${t}`, { status: 502 });
  }
  const user = await meResp.json();

  const sessionToken = await createSession(user, env.SESSION_SECRET);
  const sessCookie = setCookie(COOKIE_SESSION, sessionToken, { maxAge: 60 * 60 * 24 * 7 });

  return redirect("/", [clearState, sessCookie]);
}
