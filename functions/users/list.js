// functions/users/list.js  (GET /users/list)
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(`
      SELECT
        id              AS user_id,
        username,
        global_name,
        avatar,
        created_at
      FROM users
      ORDER BY datetime(created_at) DESC
    `).all();

    return new Response(JSON.stringify(results ?? []), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
