export async function onRequestGet({ params, env, request }) {
  const slug = params.slug.toLowerCase();
  const row = await env.DB
    .prepare(`SELECT cp.published_version_id, cp.owner_user_id, u.avatar, v.data_json
              FROM creator_pages cp
              LEFT JOIN creator_page_versions v ON cp.published_version_id = v.id
              LEFT JOIN users u ON cp.owner_user_id = u.id
              WHERE cp.slug=? AND cp.status IN ('PUBLISHED','LOCKED')`)
    .bind(slug)
    .first();
  if (!row || !row.data_json) return new Response("Not found", { status: 404 });
  let data;
  try { data = JSON.parse(row.data_json); } catch { data = {}; }

  function discordAvatarUrl(userId, avatarHash, size = 240) {
    if (userId && avatarHash) {
      const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
    }
    try {
      const idx = BigInt(userId ?? 0n) % 5n;
      return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    } catch {
      return `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
  }
  const avatarUrl = data.avatar_url || discordAvatarUrl(row.owner_user_id, row.avatar);

  const templateUrl = new URL('/creators/creator-page-template.html', request.url);
  const tplResp = await env.ASSETS.fetch(templateUrl);
  let html = await tplResp.text();
  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  html = html
    .replace(/\{CREATOR_DISPLAY_NAME\}/g, escapeHtml(data.display_name || slug))
    .replace(/\{PFP_SRC\}/g, escapeHtml(avatarUrl))
    .replace(/\{DISCORD_INVITE\}/g, escapeHtml(data.discord_invite || '#'))
    .replace(/\{ABOUT_TEXT\}/g, escapeHtml(data.about || ''))
    .replace(/\{DISCORD_TEXT\}/g, escapeHtml(data.discord_text || ''));

  let linksHtml = '';
  if (Array.isArray(data.social_links)) {
    for (const l of data.social_links) {
      if (!l?.url || !l?.label) continue;
      let img = '';
      const light = l.icon_light || (l.icon_dark ? null : l.icon) || null;
      const dark = l.icon_dark || null;
      if (light && dark) {
        img = `<img class="theme-icon" src="${escapeHtml(light)}" data-light-icon="${escapeHtml(light)}" data-dark-icon="${escapeHtml(dark)}" alt="${escapeHtml(l.label)}">`;
      } else {
        const src = light || dark || l.icon;
        if (src) img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(l.label)}">`;
      }
      linksHtml += `<li class="card"><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${img}<span class="creator-name">${escapeHtml(l.label)}</span></a></li>`;
    }
  }
  html = html.replace(/<ul class="icon-group">[\s\S]*?<\/ul>/, `<ul class="icon-group">${linksHtml}</ul>`);

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
