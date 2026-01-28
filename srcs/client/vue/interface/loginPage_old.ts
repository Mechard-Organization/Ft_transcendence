// loginPage.ts
export function loginPage(header: string, footer: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1 class="title">Login</h1>

      <form id="loginForm" class="form-container">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" placeholder="Nom d'utilisateur" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" placeholder="Mot de passe" />
        </div>

        <button id="loginBtn" class="btn-primary" type="submit">Se connecter</button>
        <p id="loginError" style="color:red;"></p>
      </form>

      <section id="twofaSection" style="display:none;">
        <h2>2FA</h2>
        <div class="form-group">
          <label for="twofaCode">Code de verification</label>
          <input type="text" id="twofaCode" placeholder="123456" />
        </div>
        <button id="twofaBtn" class="btn-primary">Verifier</button>
      </section>
    </main>
    ${footer}
  `;
  
  const usernameInput = document.getElementById("username") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;
  const errorEl = document.getElementById("loginError") as HTMLParagraphElement | null;
  const form = document.getElementById("loginForm") as HTMLFormElement | null;
  const twofaSection = document.getElementById("twofaSection") as HTMLElement | null;
  const twofaCodeInput = document.getElementById("twofaCode") as HTMLInputElement | null;
  const twofaBtn = document.getElementById("twofaBtn") as HTMLButtonElement | null;

  // if (!usernameInput || !passwordInput || !errorEl || !form) {
  //   console.error("LoginPage: élément manquant dans le DOM");
  //   return;
  // }

  form.onsubmit = async (e) => {
    e.preventDefault();

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
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        errorEl.textContent = data.message || "Identifiants invalides.";
        return;
      }

      if (data.twofa_required) {
        if (twofaSection) twofaSection.style.display = "block";
        return;
      }

      window.location.hash = "#profil";
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Erreur réseau, réessaie plus tard.";
    }
  };

  twofaBtn?.addEventListener("click", async () => {
    if (!twofaCodeInput?.value) {
      errorEl.textContent = "Code requis.";
      return;
    }

    try {
      const response = await fetch("/api/auth/login/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: twofaCodeInput.value.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        errorEl.textContent = data.error || "Code invalide.";
        return;
      }

      window.location.hash = "#profil";
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Erreur réseau, réessaie plus tard.";
    }
  });
}
