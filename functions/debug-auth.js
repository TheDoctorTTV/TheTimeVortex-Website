import { getUserFromRequest } from "./_session.js";
import { isAdmin } from "./_db.js";

export async function onRequestGet({ request, env }) {
  if (env.NODE_ENV === 'production') return new Response("Not found", { status: 404 });
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!(await isAdmin(env, user.id))) return new Response("Forbidden", { status: 403 });
  const url = new URL(request.url);
  const redirect_uri = `${url.protocol}//${url.host}/callback`;
  return new Response(JSON.stringify({ host: url.host, redirect_uri }, null, 2), {
    headers: { "content-type": "application/json" }
  });
}
