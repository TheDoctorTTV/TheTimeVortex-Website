import { getUserFromRequest } from "./_session.js";
import { isAdmin } from "./_db.js";

export async function onRequestGet({ request, env }) {
  if (env.NODE_ENV === 'production') return new Response("Not found", { status: 404 });
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!(await isAdmin(env, user.id))) return new Response("Forbidden", { status: 403 });
  return new Response(JSON.stringify({
    has_CLIENT_ID: !!env.DISCORD_CLIENT_ID,
    has_CLIENT_SECRET: !!env.DISCORD_CLIENT_SECRET,
    has_SESSION_SECRET: !!env.SESSION_SECRET
  }, null, 2), { headers: { "content-type": "application/json" }});
}
