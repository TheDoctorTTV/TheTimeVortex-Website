// Authentication helpers for login/logout and displaying user info

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("auth-container");
  if (!container) return;

  const showLogin = () => {
    container.textContent = "";
    const btn = document.createElement("button");
    btn.id = "login";
    btn.textContent = "Login";
    btn.addEventListener("click", () => {
      window.location.href = "/login";
    });
    container.appendChild(btn);
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
      container.textContent = "";
      const img = document.createElement("img");
      img.src = avatarUrl;
      img.alt = name;
      img.className = "header-pfp";
      container.appendChild(img);

      const link = document.createElement("a");
      link.href = "/pages/profile.html";
      link.className = "header-username";
      link.textContent = name;
      container.appendChild(link);

      const logout = document.createElement("button");
      logout.id = "logout";
      logout.textContent = "Logout";
      logout.addEventListener("click", async () => {
        await fetch("/logout", { method: "POST" });
        window.location.reload();
      });
      container.appendChild(logout);
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
});


