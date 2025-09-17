document.addEventListener('DOMContentLoaded', async () => {
  const ul = document.getElementById('creator-list');
  if (!ul) return;
  try {
    const res = await fetch('/creators/list', { cache: 'no-store' });
    if (!res.ok) return;
    const list = await res.json();
    for (const c of list) {
      const li = document.createElement('li');
      li.className = 'card';
      const a = document.createElement('a');
      a.href = `/pages/creators/${c.slug}.html`;
      if (c.avatar_url) {
        const img = document.createElement('img');
        img.src = c.avatar_url;
        img.alt = c.display_name || c.slug;
        a.appendChild(img);
      }
      const span = document.createElement('span');
      span.className = 'creator-name';
      span.textContent = c.display_name || c.slug;
      a.appendChild(span);
      li.appendChild(a);
      ul.appendChild(li);
    }
  } catch (e) { console.error(e); }
});
