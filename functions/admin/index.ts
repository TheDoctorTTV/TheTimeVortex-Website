import { ensureSeed, requireAdmin, csrfCookie } from '../api/admin/utils';

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  await ensureSeed(env as any);
  const uid = await requireAdmin(request, env as any);
  if (!uid) return new Response('Forbidden', { status: 403 });

  const token = crypto.randomUUID();
  const headers = new Headers({ 'content-type': 'text/html; charset=utf-8' });
  headers.append('Set-Cookie', csrfCookie(token));

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Admin</title></head>
<body>
<h1>Admin Dashboard</h1>
<ul id="admin-list"></ul>
<form id="add"><input id="add-id" placeholder="user id"><button>Add</button></form>
<form id="remove"><input id="remove-id" placeholder="user id"><button>Remove</button></form>
<script>
const csrf = '${token}';
async function refresh(){
  const res=await fetch('/api/admin/list',{credentials:'include'});
  const data=await res.json();
  const ul=document.getElementById('admin-list');
  ul.innerHTML='';
  data.forEach(a=>{const li=document.createElement('li');li.textContent=a.username+' ('+a.user_id+')';ul.appendChild(li);});
}
refresh();

document.getElementById('add').addEventListener('submit',async e=>{e.preventDefault();const id=(document.getElementById('add-id') as HTMLInputElement).value;await fetch('/api/admin/add',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({user_id:id})});refresh();});

document.getElementById('remove').addEventListener('submit',async e=>{e.preventDefault();const id=(document.getElementById('remove-id') as HTMLInputElement).value;await fetch('/api/admin/remove',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({user_id:id})});refresh();});
</script>
</body></html>`;

  return new Response(html, { headers });
};
