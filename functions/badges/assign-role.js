import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";

async function fetchMembersWithRole(env, roleId, guildId) {
  const token = env.DISCORD_BOT_TOKEN;
  const members = [];
  if (!guildId || !token) return members;

  let after = "0";
  while (true) {
    const url = `https://discord.com/api/guilds/${guildId}/members?limit=1000&after=${after}`;
    const res = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
    if (!res.ok) throw new Error(`Discord API ${res.status}`);
    const chunk = await res.json();
    if (!Array.isArray(chunk) || !chunk.length) break;
    for (const m of chunk) {
      if (m.roles?.includes(roleId) && m.user?.id) {
        members.push(m.user.id);
      }
    }
    if (chunk.length < 1000) break;
    after = chunk[chunk.length - 1].user.id;
  }
  return members;
}

export async function onRequestPost({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) {
    return new Response("Forbidden", { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
  const { badge_id } = body || {};
  if (!badge_id) return new Response("badge_id required", { status: 400 });

  try {
    const badge = await env.DB.prepare("SELECT discord_role_id, discord_guild_id FROM badges WHERE id=?").bind(badge_id).first();
    if (!badge || !badge.discord_role_id || !badge.discord_guild_id) {
      return new Response(JSON.stringify({ ok: true, assigned: 0 }), {
        headers: { "content-type": "application/json" },
      });
    }

    const userIds = await fetchMembersWithRole(env, badge.discord_role_id, badge.discord_guild_id);
    let count = 0;
    for (const uid of userIds) {
      await env.DB.prepare("INSERT OR IGNORE INTO users (id) VALUES (?)").bind(uid).run();
      await env.DB.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)").bind(uid, badge_id).run();
      count++;
    }

    return new Response(JSON.stringify({ ok: true, assigned: count }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
