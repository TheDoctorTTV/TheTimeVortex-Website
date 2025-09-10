export async function onRequestGet({ env }) {
  if (!env?.DB) return new Response("[]", { headers: { "content-type": "application/json" } });
  try {
    const { results } = await env.DB.prepare(
      `SELECT cp.slug, v.data_json FROM creator_pages cp
         LEFT JOIN creator_page_versions v ON cp.published_version_id = v.id
        WHERE cp.status IN ('PUBLISHED','LOCKED')
        ORDER BY datetime(cp.updated_at) DESC`
    ).all();
    const list = (results || []).map(r => {
      let data;
      try { data = JSON.parse(r.data_json || '{}'); } catch { data = {}; }
      return {
        slug: r.slug,
        display_name: data.display_name || r.slug,
        avatar_url: data.avatar_url || null,
      };
    });
    return new Response(JSON.stringify(list), {
      headers: { "content-type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
