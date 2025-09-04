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
        <div class="user-dropdown">
          <button id="user-menu" class="user-menu">
            <img src="${avatarUrl}" alt="${name}" class="header-pfp"/>
            <span class="header-username">${name}</span>
          </button>
          <div class="dropdown-content" id="user-dropdown">
            <button id="logout">Logout</button>
          </div>
        </div>
      `;

      const menuBtn = document.getElementById("user-menu");
      const dropdown = document.getElementById("user-dropdown");
      menuBtn?.addEventListener("click", () => {
        dropdown?.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!menuBtn?.contains(e.target) && !dropdown?.contains(e.target)) {
          dropdown?.classList.remove("show");
        }
      });

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


