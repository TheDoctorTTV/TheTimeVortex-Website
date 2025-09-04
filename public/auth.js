document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("login");
  if (btn) btn.addEventListener("click", () => { window.location.href = "/login"; });
});
