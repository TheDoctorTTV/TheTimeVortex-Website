import { getUserFromRequest } from "../_session.js";
import { isAdmin } from "../_db.js";

export async function onRequestGet({ request, env }) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!(await isAdmin(env, user.id))) return new Response("Forbidden", { status: 403 });

  try {
    const cols = await env.DB
      .prepare(`SELECT name FROM pragma_table_info('users')`)
      .all();
    const have = new Set(cols.results.map(r => r.name));

    const select = [
      `id AS user_id`,
      `username`,
      have.has('global_name') ? `global_name` : `NULL AS global_name`,
      have.has('avatar')      ? `avatar`      : `NULL AS avatar`,
      `created_at`,
    ].join(',\n');

    const { results } = await env.DB
      .prepare(`SELECT ${select} FROM users ORDER BY datetime(created_at) DESC`)
      .all();

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
