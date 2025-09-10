// functions/_session.js
import { readSession } from "./_utils"; // createSession is used in callback
import { upsertUser } from "./_db";

// Ensure a user record exists for the given Discord user. We always key on the
// stable Discord snowflake so badge assignments persist across logins.
export async function ensureUser(env, discordUser) {
  if (!env?.DB || !discordUser?.id) return;
  await upsertUser(env, discordUser);
}

export async function getUserFromRequest(request, env) {
  // pass the secret string, not the whole env
  const session = await readSession(request, env.SESSION_SECRET);
  if (!session) return null;
  // Always return the stable Discord ID for downstream calls
  return { ...session, id: session.id, discord_id: session.id };
}
