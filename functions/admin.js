import { getUserFromRequest } from "./_session";
import { isAdmin } from "./_db";
import { setCookie } from "./_utils";

const DENY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/style.css">
    <title>TheTimeVortex</title>
    <link rel="shortcut icon" type="image/x-icon" href="\icons\WebsiteLogo.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="\icons\WebsiteLogo.ico">
    <link rel="icon" type="image/png" sizes="192x192" href="\icons\WebsiteLogo.ico">
    <meta property="og:type" content="website">
    <meta property="og:title" content="TheTimeVortex" />
    <meta property="og:description" content="A group of creators making entertainment." />
    <meta property="og:url" content="https://thetimevortex.net" />
    <meta property="og:image" content="icons/WebsiteLogo.ico" />
    <script src="/js/header-footer.js"></script>
    <script type="text/javascript" src="/js/darkmode.js" defer></script>
    <script src="/public/auth.js" defer></script>
    <script>
        (function () {
            const darkmode = localStorage.getItem('darkmode');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (darkmode === 'dark' || (darkmode === 'system' && systemPrefersDark)) {
                document.documentElement.classList.add('darkmode');
            }
        })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Kodchasan:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
        rel="stylesheet">
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

    // 3. Serve admin page with CSRF token cookie and meta tag
    const token = crypto.randomUUID();
    const cookie = setCookie("csrf_token", token, {
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
    });

    const asset = await env.ASSETS.fetch(request);
    let html = await asset.text();
    html = html.replace("</head>", `<meta name="csrf-token" content="${token}"></head>`);

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "Set-Cookie": cookie,
      },
    });

  } catch (err) {
    console.error("Admin route error:", err);
    return new Response(DENY_HTML, {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}
