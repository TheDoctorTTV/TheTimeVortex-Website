import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
    name,
    description = null,
    color = "#ffffff",
    priority = 0,
    is_system = false,
    discord_role_id = null,
    discord_guild_id = null,
  } = body || {};

  if (!name) return new Response("name required", { status: 400 });

  id = slugify(id || name);
  if (!id) return new Response("invalid id", { status: 400 });

  color = String(color || '').trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return new Response("invalid color", { status: 400 });
  }

  priority = Number(priority) || 0;
  is_system = is_system ? 1 : 0;
  discord_role_id = discord_role_id ? String(discord_role_id) : null;
  discord_guild_id = discord_guild_id ? String(discord_guild_id) : null;

  try {
    await env.DB.prepare(`
      INSERT INTO badges (id, name, description, color, priority, is_system, discord_role_id, discord_guild_id)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    `).bind(id, name, description, color, priority, is_system, discord_role_id, discord_guild_id).run();

    const created = await env.DB.prepare(
      `SELECT id, name, description, color, priority, is_system, created_at, discord_role_id, discord_guild_id FROM badges WHERE id=?`
    ).bind(id).first();

    return new Response(JSON.stringify(created), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
