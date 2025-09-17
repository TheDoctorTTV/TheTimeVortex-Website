import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";

function buildAssetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return new Request(url.toString(), request);
}

function redirectToUnauthorized(request, statusCode) {
  const url = new URL("/unauthorized.html", request.url);
  if (statusCode) url.searchParams.set("status", String(statusCode));
  return Response.redirect(url.toString(), 302);
}

export async function onRequestGet({ request, env }) {
  try {
    const user = await getUserFromRequest(request, env);
    if (!user?.id) {
      return redirectToUnauthorized(request, 401);
    }

    const ok = await isAdmin(env, user.id);
    if (!ok) {
      return redirectToUnauthorized(request, 403);
    }

    return await env.ASSETS.fetch(buildAssetRequest(request, "/admin.html"));
  } catch (err) {
    console.error("Admin route error:", err);
    return redirectToUnauthorized(request, 500);
  }
}
