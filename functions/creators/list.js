import { SUPER_ADMIN_ID } from "../_constants";

export async function onRequestGet({ env }) {
  if (!env?.DB)
    return new Response("[]", { headers: { "content-type": "application/json" } });
  try {
    const { results } = await env.DB.prepare(
      `SELECT cp.slug, cp.owner_user_id, v.data_json
         FROM creator_pages cp
         LEFT JOIN creator_page_versions v ON cp.published_version_id = v.id
        WHERE cp.status IN ('PUBLISHED','LOCKED')`
    ).all();

    const list = (results || []).map(r => {
      let data;
      try {
        data = JSON.parse(r.data_json || '{}');
      } catch {
        data = {};
      }
      return {
        slug: r.slug,
        owner_user_id: r.owner_user_id,
        display_name: data.display_name || r.slug,
        avatar_url: data.avatar_url || null,
      };
    });

    list.sort((a, b) => {
      if (a.owner_user_id === SUPER_ADMIN_ID) return -1;
      if (b.owner_user_id === SUPER_ADMIN_ID) return 1;
      return a.display_name.localeCompare(b.display_name, undefined, {
        sensitivity: "base",
      });
    });

    const cleaned = list.map(({ owner_user_id, ...rest }) => rest);
    return new Response(JSON.stringify(cleaned), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
