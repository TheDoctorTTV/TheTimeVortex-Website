import { getUserFromRequest } from "../../_session";
import { isAdmin } from "../../_db";
import { checkRateLimit } from "../../_rate-limit";

interface AdminRow { user_id: string; username: string }

export async function onRequestGet({ request, env }: { request: Request; env: any }): Promise<Response> {
  const me = await getUserFromRequest(request, env);
  const ip = request.headers.get("cf-connecting-ip") || "";
  if (!me) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  if (!checkRateLimit(ip, me.id)) {
    return new Response(JSON.stringify({ message: "Rate limit" }), {
      status: 429,
      headers: { "content-type": "application/json" }
    });
  }
  if (!(await isAdmin(env, me.id))) {
    return new Response(JSON.stringify({ message: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }

  const rows = await env.DB.prepare(
    "SELECT a.user_id, u.username FROM admin a JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC"
  ).all();
  const result: AdminRow[] = rows.results || [];
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" }
  });
}
