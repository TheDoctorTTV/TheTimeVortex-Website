import { getUserFromRequest } from "../_session";

export async function onRequestGet({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me) return new Response("Not logged in", { status: 401 });

  try {
    const { results } = await env.DB.prepare(
      `SELECT b.id, b.name, b.description, b.color, b.priority, b.is_system, b.created_at, b.discord_role_id
         FROM user_badges ub
         JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = ?
        ORDER BY b.priority DESC, datetime(b.created_at) DESC`
    ).bind(me.id).all();
    return new Response(JSON.stringify(results || []), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
