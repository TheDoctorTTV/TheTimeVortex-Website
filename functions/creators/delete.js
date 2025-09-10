import { getUserFromRequest } from "../_session";
import { hasCreatorBadge, isAdmin } from "../_db";

export async function onRequestPost({ request, env }) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response("Not logged in", { status: 401 });

  const db = env.DB;
  const { searchParams } = new URL(request.url);
  const slugParam = searchParams.get("slug");

  let page;
  if (slugParam) {
    page = await db
      .prepare("SELECT id, owner_user_id FROM creator_pages WHERE slug=?")
      .bind(slugParam)
      .first();
  } else {
    page = await db
      .prepare("SELECT id, owner_user_id FROM creator_pages WHERE owner_user_id=?")
      .bind(user.id)
      .first();
  }
  if (!page) return new Response("Missing page", { status: 404 });

  const [admin, creator] = await Promise.all([
    isAdmin(env, user.id),
    hasCreatorBadge(env, user.id),
  ]);
  if (!admin && (!creator || page.owner_user_id !== user.id)) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "cache-control": "no-store, private" },
    });
  }

  await db
    .prepare("DELETE FROM creator_pages WHERE id=?")
    .bind(page.id)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store, private",
    },
  });
}
