// /functions/admin/list.js (Cloudflare Pages Function)
export async function onRequestGet({ env }) {
  try {
    const db = env.DB; // D1 binding name
    const { results } = await db
      .prepare(`
        SELECT
          a.user_id,
          a.added_by,
          a.created_at AS added_at,   -- <-- alias fixes the crash
          u.username
        FROM admins a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
      `)
      .all();

    return new Response(JSON.stringify(results ?? []), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    // Helpful diagnostic while you’re iterating
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
