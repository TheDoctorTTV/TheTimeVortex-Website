export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const redirect_uri = `${url.protocol}//${url.host}/callback`;
  return new Response(JSON.stringify({ host: url.host, redirect_uri }, null, 2), {
    headers: { "content-type": "application/json" }
  });
}
