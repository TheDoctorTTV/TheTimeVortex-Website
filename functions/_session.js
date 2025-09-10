// functions/_session.js
import { readSession } from "./_utils"; // createSession is used in callback

// Ensure a user record exists for the given Discord user. We always key on the
// stable Discord snowflake so badge assignments persist across logins.
export async function ensureUser(env, discordUser) {
  if (!env?.DB || !discordUser?.id) return;
  const db = env.DB;

  const existing = await db
    .prepare("SELECT id FROM users WHERE id=?")
    .bind(discordUser.id)
    .first();

  if (!existing) {
    await db
      .prepare(
        "INSERT INTO users (id, username, created_at) VALUES (?1, ?2, datetime('now'))"
      )
      .bind(discordUser.id, discordUser.username ?? null)
      .run();
  } else {
    await db
      .prepare("UPDATE users SET username = COALESCE(?2, username) WHERE id = ?1")
      .bind(discordUser.id, discordUser.username ?? null)
      .run();
  }

  // Optional columns; ignore failures if schema lacks them
  try {
    await db
      .prepare(
        `UPDATE users
            SET global_name = COALESCE(?2, global_name),
                avatar      = COALESCE(?3, avatar),
                email       = COALESCE(?4, email)
          WHERE id = ?1`
      )
      .bind(
        discordUser.id,
        discordUser.global_name ?? null,
        discordUser.avatar ?? null,
        discordUser.email ?? null
      )
      .run();
  } catch {}
}

export async function getUserFromRequest(request, env) {
  // pass the secret string, not the whole env
  const session = await readSession(request, env.SESSION_SECRET);
  if (!session) return null;
  // Always return the stable Discord ID for downstream calls
  return { ...session, id: session.id, discord_id: session.id };
}
