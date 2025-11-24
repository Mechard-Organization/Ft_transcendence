// loginPage.ts
export function loginPage() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <h1>Login</h1>

    <div>
      <input type="text" id="username" placeholder="Nom d'utilisateur" />
      <br/><br/>
      <input type="password" id="password" placeholder="Mot de passe" />
      <br/><br/>
      <button id="loginBtn">Se connecter</button>
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

    // ✅ 1. Validation de base
    if (!username || !password) {
      errorEl.textContent = "Nom d'utilisateur et mot de passe requis.";
      return;
    }

    try {
      // ✅ 2. Appel au backend
      const response = await fetch("https://localhost:8443/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        errorEl.textContent = data.message || "Identifiants invalides.";
        return;
      }

      const data = await response.json();

      // ✅ 3. Stockage du token (si tu es en JWT côté front)
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // ✅ 4. Redirection vers la page de jeu ou home
      window.location.hash = "#game";
      // si tu as une fonction gamePage():
      // gamePage();
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Erreur réseau, réessaie plus tard.";
    }
  };
}
