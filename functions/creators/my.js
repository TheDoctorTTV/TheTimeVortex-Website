import { getUserFromRequest } from "../_session";
import { hasCreatorBadge, isAdmin } from "../_db";

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";
}

export async function onRequestGet({ request, env }) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Not logged in", { status: 401 });

  const [admin, creator] = await Promise.all([
    isAdmin(env, user.id),
    hasCreatorBadge(env, user.id),
  ]);
  if (!admin && !creator) return new Response("Forbidden", { status: 403 });

  const db = env.DB;
  let page = await db
    .prepare("SELECT id, slug FROM creator_pages WHERE owner_user_id=?")
    .bind(user.id)
    .first();

  if (!page) {
    let slug = slugify(user.username);
    const exists = await db
      .prepare("SELECT 1 FROM creator_pages WHERE slug=?")
      .bind(slug)
      .first();
    if (exists) slug = slug + "-" + user.id;

    const id = crypto.randomUUID();
    await db
      .prepare(`INSERT INTO creator_pages (id, slug, owner_user_id, template_id, data_json, status, created_at, updated_at)
                VALUES (?1, ?2, ?3, 'creator-default', '{}', 'DRAFT', datetime('now'), datetime('now'))`)
      .bind(id, slug, user.id)
      .run();
    page = { id, slug };
  }

  return new Response(null, {
    status: 302,
    headers: { Location: `/pages/creators/${page.slug}.html` },
  });
}
