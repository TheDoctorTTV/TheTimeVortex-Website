import { getUserFromRequest } from "../_session";
import { hasCreatorBadge, isAdmin } from "../_db";

export async function onRequestGet({ request, env }) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Not logged in", { status: 401 });

  const [admin, creator] = await Promise.all([
    isAdmin(env, user.id),
    hasCreatorBadge(env, user.id),
  ]);
  if (!admin && !creator) return new Response("Forbidden", { status: 403 });

  const db = env.DB;
  const { searchParams } = new URL(request.url);
  const slugParam = searchParams.get("slug");

  let page;
  if (slugParam) {
    page = await db
      .prepare(
        "SELECT id, slug, data_json, status, owner_user_id FROM creator_pages WHERE slug=?"
      )
      .bind(slugParam)
      .first();

    if (page?.owner_user_id && page.owner_user_id !== user.id && !admin) {
      return new Response("Forbidden", { status: 403 });
    }

    if (page && !page.owner_user_id) {
      await db
        .prepare(
          "UPDATE creator_pages SET owner_user_id=?, updated_at=datetime('now') WHERE id=?"
        )
        .bind(user.id, page.id)
        .run();
      page.owner_user_id = user.id;
    }
  }

  if (!page) {
    page = await db
      .prepare(
        "SELECT id, slug, data_json, status FROM creator_pages WHERE owner_user_id=?"
      )
      .bind(user.id)
      .first();

    if (!page) {
      let slug = (user.username || "user")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
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
      page = { id, slug, data_json: '{}', status: 'DRAFT', owner_user_id: user.id };
    } else {
      page.owner_user_id = user.id;
    }
  }

  if (!page) return new Response("Missing page", { status: 404 });

  let avatarHash = null;
  try {
    const ownerRow = await db
      .prepare("SELECT avatar FROM users WHERE id=?")
      .bind(page.owner_user_id)
      .first();
    avatarHash = ownerRow?.avatar || null;
  } catch {}

  return new Response(
    JSON.stringify({
      slug: page.slug,
      data_json: page.data_json ? JSON.parse(page.data_json) : {},
      status: page.status,
      owner_user_id: page.owner_user_id,
      owner_avatar: avatarHash,
    }),
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, private",
      },
    }
  );
}
