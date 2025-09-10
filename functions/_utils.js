// Small helpers for cookies, crypto signing, and sessions
export const COOKIE_SESSION = "ttv_sess";
export const COOKIE_STATE = "ttv_state";

const encoder = new TextEncoder();

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function parseCookies(request) {
  const header = request.headers.get("cookie") || "";
  return Object.fromEntries(
    header.split(/;\s*/).filter(Boolean).map(v => {
      const i = v.indexOf("=");
      return [decodeURIComponent(v.slice(0, i)), decodeURIComponent(v.slice(i + 1))];
    })
  );
}

export function setCookie(name, value, { maxAge, path = "/", secure = true, httpOnly = true, sameSite = "Lax", domain } = {}) {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
  ];
  if (secure) parts.push("Secure");
  if (httpOnly) parts.push("HttpOnly");
  if (typeof maxAge === "number") parts.push(`Max-Age=${maxAge}`);
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

export async function sign(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64url(sig);
}

export async function verify(data, sig, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const bytes = Uint8Array.from(atob(sig.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, bytes, encoder.encode(data));
}

export async function createSession(user, secret) {
  const payload = {
    sub: user.id,
    id: user.id,                         // add this
    name: user.global_name || user.username,
    username: user.username,
    global_name: user.global_name || null,
    avatar: user.avatar || null,         // already added
    email: user.email || null,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  };
  const body = base64url(encoder.encode(JSON.stringify(payload)));
  const sig = await sign(body, secret);
  return `${body}.${sig}`;
}


export async function readSession(request, secret) {
  const { [COOKIE_SESSION]: token } = parseCookies(request);
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!(await verify(body, sig, secret))) return null;
  const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
  if (json.exp && json.exp < Math.floor(Date.now() / 1000)) return null;
  return json;
}

export function redirect(url, cookies = []) {
  const headers = new Headers({ Location: url });
  for (const c of cookies) headers.append("Set-Cookie", c);  // <-- append, don't assign array
  return new Response(null, { status: 302, headers });
}
