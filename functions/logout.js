export async function onRequestPost() {
  const clear = `ttv_sess=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
  return new Response(null, { status: 204, headers: { "Set-Cookie": clear } });
}
