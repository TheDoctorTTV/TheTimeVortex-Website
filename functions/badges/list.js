import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

export async function onRequestGet({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, description, color, priority, is_system, created_at, discord_role_id FROM badges ORDER BY priority DESC, datetime(created_at) DESC`
    ).all();
    return new Response(JSON.stringify(results ?? []), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
