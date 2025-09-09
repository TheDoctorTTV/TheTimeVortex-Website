import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

export async function onRequestGet({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT user_id, badge_id FROM user_badges`
    ).all();
    const map = {};
    for (const row of results || []) {
      if (!map[row.user_id]) map[row.user_id] = [];
      map[row.user_id].push(row.badge_id);
    }
    const out = Object.entries(map).map(([user_id, badges]) => ({ user_id, badges }));
    return new Response(JSON.stringify(out), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
