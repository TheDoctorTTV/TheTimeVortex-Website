import { readSession } from "./_utils";
import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";

export async function onRequestGet({ request, env }) {
  const u = await getUserFromRequest(request, env);
  if (!u) return new Response("Not logged in", { status: 401 });

  const admin = await isAdmin(env, u.id);
  return new Response(JSON.stringify({ ...u, is_admin: admin }), {
    headers: { "content-type": "application/json" }
  });
}