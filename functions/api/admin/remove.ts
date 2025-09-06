import { ensureSeed, requireAdmin, rateLimit, verifyCsrf } from './utils';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  await ensureSeed(env as any);
  const me = await requireAdmin(request, env as any);
  if (!me) return new Response(JSON.stringify({ ok: false, error: 'forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
  if (!rateLimit(request, me)) return new Response(JSON.stringify({ ok: false, error: 'rate limit' }), { status: 429, headers: { 'content-type': 'application/json' } });
  if (!verifyCsrf(request)) return new Response(JSON.stringify({ ok: false, error: 'csrf' }), { status: 403, headers: { 'content-type': 'application/json' } });

  const body = await request.json<{ user_id?: string }>();
  const target = body.user_id;
  if (!target) return new Response(JSON.stringify({ ok: false, error: 'user_id required' }), { status: 400, headers: { 'content-type': 'application/json' } });

  const exists = await (env as any).DB.prepare('SELECT 1 FROM admin WHERE user_id=?').bind(target).first();
  if (!exists) return new Response(JSON.stringify({ ok: false, error: 'not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

  const countRow = await (env as any).DB.prepare('SELECT COUNT(*) as c FROM admin').first<{ c: number }>();
  if ((countRow?.c || 0) <= 1) return new Response(JSON.stringify({ ok: false, error: 'cannot remove last admin' }), { status: 400, headers: { 'content-type': 'application/json' } });

  const tx = (env as any).DB.transaction();
  try {
    await tx.prepare('DELETE FROM admin WHERE user_id=?').bind(target).run();
    await tx.prepare('INSERT INTO admin_audit (actor_user_id, target_user_id, action) VALUES (?, ?, "remove")').bind(me, target).run();
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    return new Response(JSON.stringify({ ok: false, error: 'db' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
