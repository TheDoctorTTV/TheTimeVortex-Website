import { getUserFromRequest } from "../../_session";
import { isAdmin } from "../../_db";
import { parseCookies } from "../../_utils";
import { checkRateLimit } from "../../_rate-limit";

interface ApiResponse { ok: boolean; message?: string }

export async function onRequestPost({ request, env }: { request: Request; env: any }): Promise<Response> {
  const me = await getUserFromRequest(request, env);
  const ip = request.headers.get("cf-connecting-ip") || "";
  if (!me) {
    return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  if (!checkRateLimit(ip, me.id)) {
    return new Response(JSON.stringify({ ok: false, message: "Rate limit" }), {
      status: 429,
      headers: { "content-type": "application/json" }
    });
  }
  if (!(await isAdmin(env, me.id))) {
    return new Response(JSON.stringify({ ok: false, message: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }

  const cookies = parseCookies(request);
  const csrfCookie = cookies["csrf_token"];
  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return new Response(JSON.stringify({ ok: false, message: "Invalid CSRF token" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const { user_id } = body || {};
  if (!user_id) {
    return new Response(JSON.stringify({ ok: false, message: "user_id required" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const exists = await env.DB.prepare("SELECT 1 FROM users WHERE id=?").bind(user_id).first();
  if (!exists) {
    return new Response(JSON.stringify({ ok: false, message: "User not found" }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });
  }

  const stmt1 = env.DB.prepare("INSERT OR REPLACE INTO admin (user_id, added_by) VALUES (?, ?)").bind(user_id, me.id);
  const stmt2 = env.DB.prepare("INSERT INTO admin_audit (actor_user_id, target_user_id, action) VALUES (?, ?, ?)").bind(me.id, user_id, "add");
  await env.DB.batch([stmt1, stmt2]);

  const resp: ApiResponse = { ok: true };
  return new Response(JSON.stringify(resp), {
    headers: { "content-type": "application/json" }
  });
}
