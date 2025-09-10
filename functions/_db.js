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

// Upsert a user on login; keeps profile fields fresh.
export async function upsertUser(env, u) {
  const db = env.DB;

  // Attempt to insert/update all known fields. If some columns do not exist
  // (older schema), fall back to a minimal insert+update.
  try {
    await db
      .prepare(`
        INSERT INTO users (id, username, global_name, avatar, email, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          username    = excluded.username,
          global_name = COALESCE(excluded.global_name, users.global_name),
          avatar      = COALESCE(excluded.avatar, users.avatar),
          email       = COALESCE(excluded.email, users.email),
          updated_at  = datetime('now')
      `)
      .bind(
        u.id,
        u.username ?? null,
        u.global_name ?? null,
        u.avatar ?? null,
        u.email ?? null
      )
      .run();
  } catch {
    // Fallback for schemas missing newer columns
    await db
      .prepare(`
        INSERT INTO users (id, username, created_at)
        VALUES (?1, ?2, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET username = excluded.username
      `)
      .bind(u.id, u.username ?? null)
      .run();

    try {
      await db
        .prepare(`
          UPDATE users
             SET global_name = COALESCE(?2, global_name),
                 avatar      = COALESCE(?3, avatar),
                 email       = COALESCE(?4, email)
           WHERE id = ?1
        `)
        .bind(u.id, u.global_name ?? null, u.avatar ?? null, u.email ?? null)
        .run();
    } catch {
      // no-op if columns don't exist
    }
  }
}
