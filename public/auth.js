// Authentication helpers for login/logout and displaying user info

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("auth-container");
  if (!container) return;

  const showLogin = () => {
    container.innerHTML = '<button class="invite" id="login">Login</button>';
    const btn = document.getElementById("login");
    if (btn) btn.addEventListener("click", () => {
      window.location.href = "/login";
    });
  };

  try {
    const res = await fetch("/me");
    if (res.ok) {
      const user = await res.json();
      const name = user.global_name || user.username;
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : "https://cdn.discordapp.com/embed/avatars/0.png";
      container.innerHTML = `
        <img src="${avatarUrl}" alt="${name}" class="header-pfp"/>
        <span class="header-username">${name}</span>
        <button class="invite" id="logout">Logout</button>
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


