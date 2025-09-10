import { getUserFromRequest } from "../_session";
import { hasCreatorBadge, isAdmin } from "../_db";

export async function onRequestPost({ request, env }) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Not logged in", { status: 401 });

  const [admin, creator] = await Promise.all([
    isAdmin(env, user.id),
    hasCreatorBadge(env, user.id),
  ]);

  const db = env.DB;
  const { searchParams } = new URL(request.url);
  const slugParam = searchParams.get("slug");

  let page;
  if (slugParam && admin) {
    page = await db
      .prepare("SELECT id, status FROM creator_pages WHERE slug=?")
      .bind(slugParam)
      .first();
  } else {
    page = await db
      .prepare("SELECT id, status FROM creator_pages WHERE owner_user_id=?")
      .bind(user.id)
      .first();
  }
  if (!page) return new Response("Missing page", { status: 404 });

  if (!admin && !creator) {
    await db
      .prepare("UPDATE creator_pages SET status='LOCKED' WHERE id=?")
      .bind(page.id)
      .run();
    return new Response("Forbidden", {
      status: 403,
      headers: { "cache-control": "no-store, private" },
    });
  }

  if (page.status === 'LOCKED' && !admin) {
    return new Response("Locked", {
      status: 403,
      headers: { "cache-control": "no-store, private" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const json = JSON.stringify(body);
  const versionId = crypto.randomUUID();
  await db
    .prepare("UPDATE creator_pages SET data_json=?, updated_at=datetime('now') WHERE id=?")
    .bind(json, page.id)
    .run();
  await db
    .prepare("INSERT INTO creator_page_versions (id, page_id, data_json, created_at) VALUES (?1, ?2, ?3, datetime('now'))")
    .bind(versionId, page.id, json)
    .run();
  return new Response(JSON.stringify({ ok: true, version_id: versionId }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store, private",
    },
  });
}
