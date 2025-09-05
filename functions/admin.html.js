import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";

export async function onRequestGet({ request, env }) {
  const me = await getUserFromRequest(request, env);
  if (!me || !(await isAdmin(env, me.id))) return Response.redirect("/", 302);

  // Serve the actual admin.html asset
  return env.ASSETS.fetch(request);
}
