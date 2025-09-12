export async function onRequestGet({ env }) {
  if (!env?.DB)
    return new Response("[]", { headers: { "content-type": "application/json" } });
  try {
    const { results } = await env.DB.prepare(
      `SELECT cp.slug, cp.owner_user_id, u.avatar, v.data_json
         FROM creator_pages cp
         LEFT JOIN creator_page_versions v ON cp.published_version_id = v.id
         LEFT JOIN users u ON cp.owner_user_id = u.id
        WHERE cp.status IN ('PUBLISHED','LOCKED')`
    ).all();

    const list = (results || []).map(r => {
      let data;
      try {
        data = JSON.parse(r.data_json || '{}');
      } catch {
        data = {};
      }
      function discordAvatarUrl(userId, avatarHash, size = 64) {
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
      return {
        slug: r.slug,
        display_name: data.display_name || r.slug,
        avatar_url: data.avatar_url || discordAvatarUrl(r.owner_user_id, r.avatar),
      };
    });

    list.sort((a, b) => {
      if (a.slug.toLowerCase() === "thedoctorttv") return -1;
      if (b.slug.toLowerCase() === "thedoctorttv") return 1;
      return a.display_name.localeCompare(b.display_name, undefined, {
        sensitivity: "base",
      });
    });

    return new Response(JSON.stringify(list), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
