export async function onRequestGet({ env }) {
  return new Response(JSON.stringify({
    has_CLIENT_ID: !!env.DISCORD_CLIENT_ID,
    has_CLIENT_SECRET: !!env.DISCORD_CLIENT_SECRET,
    has_SESSION_SECRET: !!env.SESSION_SECRET
  }, null, 2), { headers: { "content-type": "application/json" }});
}
