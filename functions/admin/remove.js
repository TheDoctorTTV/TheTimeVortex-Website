import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

export async function onRequestPost({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) return new Response("Forbidden", { status: 403 });

  const { user_id } = await request.json();
  if (!user_id) return new Response("user_id required", { status: 400 });

  await env.DB.prepare("DELETE FROM admins WHERE user_id=?").bind(user_id).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
}
