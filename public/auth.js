// Authentication helpers for login/logout and displaying user info

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("auth-container");
  if (!container) return;

  const showLogin = () => {
    container.innerHTML = '<button id="login">Login</button>';
    const btn = document.getElementById("login");
    if (btn) btn.addEventListener("click", () => {
      window.location.href = "/login";
    });
  };

  try {
    const res = await fetch("/me", { credentials: "include" });
    if (res.ok) {
      const user = await res.json();
      const name = user.global_name || user.username;
      const avatarUrl = (() => {
        if (user.avatar) {
          const ext = user.avatar.startsWith("a_") ? "gif" : "png";
          return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=64`;
        }
        const idx = BigInt(user.id ?? 0n) % 5n;
        return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
      })();
      container.innerHTML = `
        <img src="${avatarUrl}" alt="${name}" class="header-pfp"/>
        <a href="/profile.html" class="header-username">${name}</a>
        <button id="logout">Logout</button>
      `;
      const logout = document.getElementById("logout");
      logout?.addEventListener("click", async () => {
        await fetch("/logout", { method: "POST" });
        window.location.reload();
      });
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
});


