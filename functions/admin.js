import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";

const DENY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Access denied</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <global-header></global-header>

  <div class="container">
    <div class="main">
      <h1 class="title">🚫 Turn around</h1>
      <p class="about-me">
        You're not supposed to be here. This page is for site admins only.
      </p>
      <a class="btn" href="/">Go Home</a>
    </div>
  </div>

  <global-footer></global-footer>
</body>
</html>
`;

export async function onRequestGet({ request, env }) {
  try {
    // 1. Check session
    const user = await getUserFromRequest(request, env);
    if (!user?.id) {
      return new Response(DENY_HTML, {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // 2. Check admin flag in DB
    const ok = await isAdmin(env, user.id);
    if (!ok) {
      return new Response(DENY_HTML, {
        status: 403,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // 3. Only admins get the real static asset
    return await env.ASSETS.fetch(request);

  } catch (err) {
    console.error("Admin route error:", err);
    return new Response(DENY_HTML, {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}
