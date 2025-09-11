import { isAdmin } from "./_db.js";

export async function ensureAdminBadge(env) {
  const roleId = env.DISCORD_ADMIN_ROLE_ID;
  const guildId = env.DISCORD_GUILD_ID;
  if (!env.DB || !roleId || !guildId) return;
  await env.DB.prepare(
    `INSERT INTO badges (id, name, description, color, priority, is_system, discord_role_id, discord_guild_id)
     VALUES ('admin', 'Admin', 'Site Administrator', '#ff0000', 100, 1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET discord_role_id=excluded.discord_role_id,
                                     discord_guild_id=excluded.discord_guild_id`
  ).bind(roleId, guildId).run();
}

export async function fetchMemberRoles(env, userId, guildId) {
  const token = env.DISCORD_BOT_TOKEN;
  if (!guildId || !token) return null;
  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
      headers: { Authorization: `Bot ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.roles) ? data.roles : [];
  } catch {
    return null;
  }
}

export async function addDiscordRole(env, userId, roleId, guildId = env.DISCORD_GUILD_ID) {
  const token = env.DISCORD_BOT_TOKEN;
  if (!guildId || !token || !roleId) return;
  await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "PUT",
    headers: { Authorization: `Bot ${token}` }
  });
}

export async function removeDiscordRole(env, userId, roleId, guildId = env.DISCORD_GUILD_ID) {
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
  const adminGuild = env.DISCORD_GUILD_ID;
  await ensureAdminBadge(env);

  const rolesByGuild = new Map();

  if (adminRole && adminGuild) {
    const adminRoles = await fetchMemberRoles(env, userId, adminGuild);
    if (Array.isArray(adminRoles)) {
      rolesByGuild.set(adminGuild, new Set(adminRoles));
      const hasRole = rolesByGuild.get(adminGuild).has(adminRole);
      const isDb = await isAdmin(env, userId);
      if (hasRole && !isDb) {
        await env.DB.prepare("INSERT OR IGNORE INTO admins (user_id, added_by) VALUES (?, ?)")
          .bind(userId, userId)
          .run();
      } else if (!hasRole && isDb) {
        await env.DB.prepare("DELETE FROM admins WHERE user_id=?").bind(userId).run();
      }
    }
  }

  const { results: badgeRows } = await env.DB.prepare(
    "SELECT id, discord_role_id, discord_guild_id FROM badges WHERE discord_role_id IS NOT NULL AND discord_guild_id IS NOT NULL"
  ).all();

  // fetch roles for each guild only once
  const neededGuilds = new Set((badgeRows || []).map(b => b.discord_guild_id));
  for (const gId of neededGuilds) {
    if (!rolesByGuild.has(gId)) {
      const r = await fetchMemberRoles(env, userId, gId);
      if (Array.isArray(r)) {
        rolesByGuild.set(gId, new Set(r));
      }
    }
  }

  for (const b of badgeRows || []) {
    const set = rolesByGuild.get(b.discord_guild_id);
    if (!set) continue;
    if (set.has(b.discord_role_id)) {
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
