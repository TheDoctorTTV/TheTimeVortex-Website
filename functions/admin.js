import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";

function buildAssetRequest(request, pathname, extraHeaders = {}) {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";

  const headers = new Headers(request.headers);
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

  return new Request(url.toString(), {
    method: "GET",
    headers,
  });
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

    const assetRequest = buildAssetRequest(request, "/admin.html", {
      "x-from-admin-route": "1",
    });

    return await env.ASSETS.fetch(assetRequest);
  } catch (err) {
    console.error("Admin route error:", err);
    return redirectToUnauthorized(request, 500);
  }
}
