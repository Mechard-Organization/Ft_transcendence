// loginPage.ts
export function loginPage(header: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = header;
  app.innerHTML += `
    <h1 class="title">Login</h1>

    <div class="form-container">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input type="text" id="username" placeholder="Nom d'utilisateur" />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input type="password" id="password" placeholder="Mot de passe" />
      </div>

      <button id="loginBtn" class="btn-secondary">Se connecter</button>
      <p id="loginError" style="color:red;"></p>
    </div>
  `;

  const usernameInput = document.getElementById("username") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement | null;
  const errorEl = document.getElementById("loginError") as HTMLParagraphElement | null;

  if (!usernameInput || !passwordInput || !loginBtn || !errorEl) return;

  loginBtn.onclick = async () => {
    errorEl.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      errorEl.textContent = "Nom d'utilisateur et mot de passe requis.";
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ⚠ nécessaire pour que le cookie HttpOnly soit accepté
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        errorEl.textContent = data.message || "Identifiants invalides.";
        return;
      }

      // Ici le cookie est déjà créé.
      window.location.hash = "#profil";
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Erreur réseau, réessaie plus tard.";
    }
  };
}
