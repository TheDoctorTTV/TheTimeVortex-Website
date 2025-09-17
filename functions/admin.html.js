export async function onRequestGet({ request, env }) {
  if (request.headers.get("x-from-admin-route") === "1") {
    return env.ASSETS.fetch(request);
  }

  const url = new URL(request.url);
  url.pathname = "/admin";
  url.search = "";
  return Response.redirect(url.toString(), 302);
}
