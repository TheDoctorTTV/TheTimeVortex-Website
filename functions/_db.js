// functions/_db.js

// Single definition — do not duplicate this export
export async function isAdmin(env, userId) {
  if (!env?.DB) return false;
  try {
    const row = await env.DB
      .prepare("SELECT 1 FROM admins WHERE user_id=?")
      .bind(userId)
      .first();
    return !!row;
  } catch {
    return false;
  }
}

// Check if the user has the special "creator" badge
export async function hasCreatorBadge(env, userId) {
  if (!env?.DB) return false;
  try {
    const row = await env.DB
      .prepare("SELECT 1 FROM user_badges WHERE user_id=? AND badge_id='creator'")
      .bind(userId)
      .first();
    return !!row;
  } catch {
    return false;
  }
}

// Upsert a user on login; keeps username fresh, optionally updates extra fields
export async function upsertUser(env, u) {
  const db = env.DB;

  await db.prepare(`
    INSERT INTO users (id, username, created_at)
    VALUES (?1, ?2, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET username = excluded.username
  `).bind(u.id, u.username ?? null).run();

  // Optional columns (ignore if not present)
  try {
    await db.prepare(`
      UPDATE users
         SET global_name = COALESCE(?2, global_name),
             avatar      = COALESCE(?3, avatar)
       WHERE id = ?1
    `).bind(u.id, u.global_name ?? null, u.avatar ?? null).run();
  } catch {
    // no-op if columns don't exist
  }
}
