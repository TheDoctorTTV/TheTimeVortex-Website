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

  const { user_id, badge_id } = body || {};
  if (!user_id || !badge_id) {
    return new Response("user_id and badge_id required", { status: 400 });
  }

  try {
    await env.DB.prepare("DELETE FROM user_badges WHERE user_id=? AND badge_id=?").bind(user_id, badge_id).run();
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
