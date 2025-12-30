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
      </br>
      <div width=10>
        <button id="del" class="btn-secondary">delete user</button>
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

  const delBtn = document.getElementById("del");
  if (!delBtn) return;

  delBtn.addEventListener("click", async () => {
    const auth = await isAuthenticated();
		const id = auth ? auth.id : 0;
    try {
      const res = await fetch("/api/delUser", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        console.error("del failed");
        return;
      }

      // 👉 Tu veux vider la session côté SPA
      window.location.hash = "#login";

      // await buildHeader();
    } catch (err) {
      console.error("del error:", err);
    }
  });
}
