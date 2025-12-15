import { isAuthenticated } from "./authenticator";

export async function profilPage(header: string, footer: string) {
  const app = document.getElementById("app");
  const auth = await isAuthenticated();

  console.log(null, 200, { id: auth.id });
  if (!app) return;

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1>Profil</h1>
      <div width=10>
        <button id="logout" class="btn-secondary">Logout</button>
      </div>
    </main>
    ${footer}
  `;
  
  const logoutBtn = document.getElementById("logout");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        console.error("Logout failed");
        return;
      }

      // 👉 Tu veux vider la session côté SPA
      window.location.hash = "#login";

      // await buildHeader();
    } catch (err) {
      console.error("Logout error:", err);
    }
  });
}