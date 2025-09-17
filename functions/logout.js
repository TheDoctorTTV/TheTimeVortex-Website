import { COOKIE_SESSION, setCookie } from "./_utils.js";

export async function onRequestPost({ request }) {
  const protocol = new URL(request.url).protocol;
  const clear = setCookie(COOKIE_SESSION, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: protocol === "https:"
  });

  return new Response(null, { status: 204, headers: { "Set-Cookie": clear } });
}
