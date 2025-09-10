export async function onRequestGet({ params, env, request }) {
  const slug = params.slug.toLowerCase();
  const row = await env.DB
    .prepare(`SELECT cp.published_version_id, v.data_json
              FROM creator_pages cp
              LEFT JOIN creator_page_versions v ON cp.published_version_id = v.id
              WHERE cp.slug=? AND cp.status IN ('PUBLISHED','LOCKED')`)
    .bind(slug)
    .first();
  if (!row || !row.data_json) return new Response("Not found", { status: 404 });
  let data;
  try { data = JSON.parse(row.data_json); } catch { data = {}; }

  const templateUrl = new URL('/creators/creator-page-template.html', request.url);
  const tplResp = await env.ASSETS.fetch(templateUrl);
  let html = await tplResp.text();
  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  html = html
    .replace(/\{CREATOR_DISPLAY_NAME\}/g, escapeHtml(data.display_name || slug))
    .replace(/\{PFP_SRC\}/g, escapeHtml(data.avatar_url || ''))
    .replace(/\{DISCORD_INVITE\}/g, escapeHtml(data.discord_invite || '#'))
    .replace(/\{ABOUT_TEXT\}/g, escapeHtml(data.about || ''))
    .replace(/\{DISCORD_TEXT\}/g, escapeHtml(data.discord_text || ''));

  let linksHtml = '';
  if (Array.isArray(data.social_links)) {
    for (const l of data.social_links) {
      if (!l?.url || !l?.label) continue;
      const img = l.icon ? `<img src="${escapeHtml(l.icon)}" alt="${escapeHtml(l.label)}">` : '';
      linksHtml += `<li class="card"><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${img}<span class="creator-name">${escapeHtml(l.label)}</span></a></li>`;
    }
  }
  html = html.replace(/<ul class="icon-group">[\s\S]*?<\/ul>/, `<ul class="icon-group">${linksHtml}</ul>`);

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
