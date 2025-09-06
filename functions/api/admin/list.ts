import { ensureSeed, requireAdmin, rateLimit } from './utils';

interface AdminRow {
  user_id: string;
  username: string;
  added_by: string;
  created_at: string;
}

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  await ensureSeed(env as any);
  const uid = await requireAdmin(request, env as any);
  if (!uid) return new Response('Forbidden', { status: 403 });
  if (!rateLimit(request, uid)) return new Response(JSON.stringify({ ok: false, error: 'rate limit' }), { status: 429, headers: { 'content-type': 'application/json' } });

  const rows = await (env as any).DB.prepare(
    'SELECT a.user_id, u.username, a.added_by, a.created_at FROM admin a JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC'
  ).all<AdminRow>();

  return new Response(JSON.stringify(rows.results || []), {
    headers: { 'content-type': 'application/json' }
  });
};
