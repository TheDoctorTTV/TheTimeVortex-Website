export async function upsertUser(env, u) {
  await env.DB.batch([
    env.DB.prepare(
      "INSERT OR IGNORE INTO users (id, username, global_name, avatar, email) VALUES (?,?,?,?,?)"
    ).bind(u.id, u.username || null, u.global_name || null, u.avatar || null, u.email || null),
    env.DB.prepare(
      "UPDATE users SET username=?, global_name=?, avatar=?, email=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).bind(u.username || null, u.global_name || null, u.avatar || null, u.email || null, u.id),
  ]);
}

export async function isAdmin(env, userId) {
  const row = await env.DB.prepare("SELECT 1 FROM admins WHERE user_id=?").bind(userId).first();
  return !!row;
}
