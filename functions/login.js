import { COOKIE_STATE, setCookie } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  // Automatically use the current host + scheme (works for prod + preview + local)
  const redirectUri = `${url.protocol}//${url.host}/callback`;

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const state = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");

  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds email guilds.members.read",
    prompt: "consent",
    state
  });

  const cookie = setCookie(COOKIE_STATE, state, {
    path: "/",
    secure: url.protocol === "https:",
    httpOnly: true,
    sameSite: "Lax"
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://discord.com/oauth2/authorize?${params.toString()}`,
      "Set-Cookie": cookie
    }
  });
}
