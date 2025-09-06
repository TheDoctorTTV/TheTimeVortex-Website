import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

export async function onRequestGet({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) return new Response("Forbidden", { status: 403 });

  const rows = await env.DB.prepare(`
    SELECT a.user_id, u.username, u.global_name, u.avatar, a.added_by, a.added_at
    FROM admins a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.added_at DESC
  `).all();

  return new Response(JSON.stringify(rows.results || []), {
    headers: { "content-type": "application/json" }
  });
}
