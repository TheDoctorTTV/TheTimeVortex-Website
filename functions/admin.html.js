import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";

const DENY_HTML = `<!doctype html>
<html><head>
  <meta charset="utf-8" />
  <title>Access denied</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    :root { color-scheme: light dark; }
    body{font-family: system-ui, sans-serif; margin:0; height:100vh;
         display:grid; place-items:center; background:#111; color:#eee}
    .card{max-width:720px; padding:2rem; border-radius:18px;
          background:rgba(255,255,255,.06); box-shadow:0 10px 40px rgba(0,0,0,.35)}
    h1{margin:0 0 .5rem; font-size:2rem}
    p{opacity:.85; line-height:1.6}
    a.btn{display:inline-block; margin-top:1rem; padding:.6rem 1rem; border-radius:9999px;
          text-decoration:none; background:#ff0055; color:white; box-shadow:0 6px 24px rgba(255,0,85,.35)}
  </style>
</head>
<body>
  <div class="card">
    <h1>Turn around 🚫</h1>
    <p>You’re not supposed to be here. This page is for site admins only.</p>
    <a class="btn" href="/">Go home</a>
  </div>
</body></html>`;

export async function onRequestGet({ request, env }) {
  const u = await getUserFromRequest(request, env);

  if (!u?.id) {
    return new Response(DENY_HTML, { status: 401, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const ok = await isAdmin(env, u.id);
  if (!ok) {
    return new Response(DENY_HTML, { status: 403, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  return env.ASSETS.fetch(request);
}
