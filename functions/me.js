import { readSession } from "./_utils";

export async function onRequestGet({ request, env }) {
  const sess = await readSession(request, env.SESSION_SECRET);
  if (!sess) return new Response("Not logged in", { status: 401 });
  return new Response(JSON.stringify(sess, null, 2), { headers: { "Content-Type": "application/json" } });
}
