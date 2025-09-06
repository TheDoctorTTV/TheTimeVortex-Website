export async function isAdmin(env, userId) {
  // If D1 not bound, just return false instead of throwing
  if (!env.DB) return false;
  try {
    const row = await env.DB
      .prepare("SELECT 1 FROM admin WHERE user_id=?")
      .bind(userId)
      .first();
    return !!row;
  } catch {
    return false;
  }
}
