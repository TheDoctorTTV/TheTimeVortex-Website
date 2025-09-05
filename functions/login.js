export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  // Automatically use the current host + scheme (works for prod + preview + local)
  const redirectUri = `${url.protocol}//${url.host}/callback`;

  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds email guilds.members.read",
    prompt: "consent"
  });

  return Response.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}
