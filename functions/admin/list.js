// GET /admin/list
export async function onRequestGet({ env }) {
  try {
    const db = env.DB;

    // Detect optional columns on users so we don't 500 if they're missing
    const cols = await db.prepare(`SELECT name FROM pragma_table_info('users')`).all();
    const have = new Set(cols.results.map(r => r.name));

    const userBits = [
      have.has('username')    ? 'u.username'    : 'NULL AS username',
      have.has('global_name') ? 'u.global_name' : 'NULL AS global_name',
      have.has('avatar')      ? 'u.avatar'      : 'NULL AS avatar',
    ].join(', ');

    const { results } = await db.prepare(`
      SELECT
        a.user_id,
        a.added_by,
        a.created_at AS added_at,
        ${userBits}
      FROM admins a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
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
