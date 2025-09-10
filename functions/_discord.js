import { isAdmin } from "./_db";

export async function ensureAdminBadge(env) {
  const roleId = env.DISCORD_ADMIN_ROLE_ID;
  if (!env.DB || !roleId) return;
  await env.DB.prepare(
    `INSERT INTO badges (id, name, description, color, priority, is_system, discord_role_id)
     VALUES ('admin', 'Admin', 'Site Administrator', '#ff0000', 100, 1, ?)
     ON CONFLICT(id) DO UPDATE SET discord_role_id=excluded.discord_role_id`
  ).bind(roleId).run();
}

export async function fetchMemberRoles(env, userId) {
  const guildId = env.DISCORD_GUILD_ID;
  const token = env.DISCORD_BOT_TOKEN;
  if (!guildId || !token) return [];
  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
      headers: { Authorization: `Bot ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.roles) ? data.roles : [];
  } catch {
    return [];
  }
}

export async function addDiscordRole(env, userId, roleId) {
  const guildId = env.DISCORD_GUILD_ID;
  const token = env.DISCORD_BOT_TOKEN;
  if (!guildId || !token || !roleId) return;
  await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "PUT",
    headers: { Authorization: `Bot ${token}` }
  });
}

export async function removeDiscordRole(env, userId, roleId) {
  const guildId = env.DISCORD_GUILD_ID;
  const token = env.DISCORD_BOT_TOKEN;
  if (!guildId || !token || !roleId) return;
  await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bot ${token}` }
  });
}

export async function syncRolesAndBadges(env, userId) {
  if (!env?.DB) return;
  const adminRole = env.DISCORD_ADMIN_ROLE_ID;
  await ensureAdminBadge(env);

  const roles = await fetchMemberRoles(env, userId);

  if (adminRole) {
    const hasRole = roles.includes(adminRole);
    const isDb = await isAdmin(env, userId);
    if (hasRole && !isDb) {
      await env.DB.prepare("INSERT OR IGNORE INTO admins (user_id, added_by) VALUES (?, ?)")
        .bind(userId, userId)
        .run();
    } else if (!hasRole && isDb) {
      await env.DB.prepare("DELETE FROM admins WHERE user_id=?").bind(userId).run();
    }
  }

  const { results: badgeRows } = await env.DB.prepare(
    "SELECT id, discord_role_id FROM badges WHERE discord_role_id IS NOT NULL"
  ).all();
  const roleSet = new Set(roles);
  for (const b of badgeRows || []) {
    if (roleSet.has(b.discord_role_id)) {
      await env.DB.prepare("INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)")
        .bind(userId, b.id)
        .run();
    } else {
      await env.DB.prepare("DELETE FROM user_badges WHERE user_id=? AND badge_id=?")
        .bind(userId, b.id)
        .run();
    }
  }
}
