import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

export async function onRequestPost({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) {
    return new Response("Forbidden", { status: 403 });
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response("Bad JSON", { status: 400 }); }

  const { user_id, badge_id, badge_ids } = body || {};
  const ids = badge_id ? [badge_id] : Array.isArray(badge_ids) ? badge_ids : [];
  if (!user_id || !ids.length) {
    return new Response("user_id and badge_id(s) required", { status: 400 });
  }

  try {
    await env.DB.prepare("INSERT OR IGNORE INTO users (id) VALUES (?)").bind(user_id).run();
    for (const id of ids) {
      await env.DB.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)").bind(user_id, id).run();
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
