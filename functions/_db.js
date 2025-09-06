export async function isAdmin(env, userId) {
  // If D1 not bound, just return false instead of throwing
  if (!env.DB) return false;
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

// functions/_db.js

export async function isAdmin(env, userId) {
  if (!env.DB) return false;
  try {
    const row = await env.DB.prepare("SELECT 1 FROM admins WHERE user_id=?").bind(userId).first();
    return !!row;
  } catch {
    return false;
  }
}

// NEW: ensure a user exists + keep fields fresh on later logins
export async function upsertUser(env, u) {
  const db = env.DB;

  // create or refresh username
  await db.prepare(`
    INSERT INTO users (id, username, created_at)
    VALUES (?1, ?2, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET username = excluded.username
  `).bind(u.id, u.username ?? null).run();

  // optional extras, only if columns exist in your schema
  try {
    await db.prepare(`
      UPDATE users
         SET global_name = COALESCE(?2, global_name),
             avatar      = COALESCE(?3, avatar)
       WHERE id = ?1
    `).bind(u.id, u.global_name ?? null, u.avatar ?? null).run();
  } catch {
    // ignore if columns aren't there
  }
}
