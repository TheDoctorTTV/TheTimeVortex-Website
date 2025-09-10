// functions/users/remove.js
// Remove a user from the site DB (and drop admin role if present).
// Auth: only admins may call this.

import { getUserFromRequest } from "../_session";
import { isAdmin } from "../_db";
import { SUPER_ADMIN_ID } from "../_constants";
import { removeDiscordRole } from "../_discord";

export async function onRequestPost({ request, env }) {
  try {
    const me = await getUserFromRequest(request, env);
    if (!me) return new Response("Unauthorized", { status: 401 });
    if (!(await isAdmin(env, me.id))) return new Response("Forbidden", { status: 403 });

    let body;
    try { body = await request.json(); } 
    catch { return new Response("Bad JSON", { status: 400 }); }

    const { user_id } = body || {};
    if (!user_id) return new Response("user_id required", { status: 400 });
    if (user_id === SUPER_ADMIN_ID) {
      return new Response("Cannot remove super admin.", { status: 400 });
    }

    // Optional: prevent self-deletion
    if (user_id === me.id) {
      return new Response("Refusing to remove yourself.", { status: 400 });
    }

    // Delete admin row (if any), then user row
    const delAdmin = env.DB.prepare("DELETE FROM admins WHERE user_id=?").bind(user_id);
    const delUser  = env.DB.prepare("DELETE FROM users  WHERE id=?").bind(user_id);
    await env.DB.batch([delAdmin, delUser]);
    await removeDiscordRole(env, user_id, env.DISCORD_ADMIN_ROLE_ID);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
