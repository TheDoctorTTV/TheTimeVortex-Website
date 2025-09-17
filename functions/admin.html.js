export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  url.pathname = "/admin";
  url.search = "";
  return Response.redirect(url.toString(), 302);
}
