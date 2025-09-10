import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";
import { ensureAdminBadge, addDiscordRole } from "../_discord";

export async function onRequestPost({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) return new Response("Forbidden", { status: 403 });

  const { user_id } = await request.json();
  if (!user_id) return new Response("user_id required", { status: 400 });

  await env.DB.prepare("INSERT OR IGNORE INTO users (id) VALUES (?)").bind(user_id).run();
  await env.DB.prepare("INSERT OR IGNORE INTO admins (user_id, added_by) VALUES (?, ?)").bind(user_id, me.id).run();
  await ensureAdminBadge(env);
  await env.DB.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, 'admin')").bind(user_id).run();
  await addDiscordRole(env, user_id, env.DISCORD_ADMIN_ROLE_ID, env.DISCORD_GUILD_ID);

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
}
