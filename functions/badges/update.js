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

  let {
    id,
    description = null,
    color,
    discord_role_id = null,
  } = body || {};

  if (!id) return new Response("id required", { status: 400 });
  if (!color) return new Response("color required", { status: 400 });

  color = String(color || "").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return new Response("invalid color", { status: 400 });
  }

  description = description === null ? null : String(description);
  discord_role_id = discord_role_id ? String(discord_role_id) : null;

  try {
    await env.DB.prepare(
      "UPDATE badges SET description=?2, color=?3, discord_role_id=?4 WHERE id=?1"
    ).bind(id, description, color, discord_role_id).run();

    const updated = await env.DB.prepare(
      `SELECT id, name, description, color, priority, is_system, created_at, discord_role_id FROM badges WHERE id=?`
    ).bind(id).first();

    return new Response(JSON.stringify(updated), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

