import validator from "validator";
import zxcvbn from "zxcvbn";

// Validation du mot de passe
export function validatePassword(password: string, username: string) {
  // Interdit "password == username"
  if (password.toLowerCase() === username.toLowerCase()) {
    return { ok: false, score: 0, reason: "Le mot de passe matche avec le username" };
  }

  // Règles strictes (tu peux adapter minLength etc.)
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return { ok: false, score: 0, reason: "Le mot de passe doit contenir au moins 1 minuscule, 1 majuscule et 1 chiffre et faire au moins 8 caractères de longueurs !" };
  }

  // Score zxcvbn
  const score = zxcvbn(password, [username]).score;

  return {
    ok: score >= 2,
    score,
    reason: score < 3 ? "Mot de passe trop faible" : "Mot de passe fort",
  };
}

export function validateEmail(email: string) {
  if (!email) return { ok: false, reason: "Email required" };

  if (!validator.isEmail(email, {
    allow_utf8_local_part: true,
    require_tld: true,
    allow_ip_domain: false,
    })) {
    return { ok: false, reason: "Invalid email format" };
  }

  return { ok: true, reason: "Valid email" };
}

// registerPage.ts
export function registerPage(header: string, footer: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = header;
  app.innerHTML += `
    <h1 class="title">Créer un compte</h1>

  <div class="form-container">
    <div class="form-group">
      <label for="username">Nom d'utilisateur</label>
      <input type="text" id="username" placeholder="Nom d'utilisateur" />
    </div>

    <div class="form-group">
      <label for="password">Mot de passe</label>
      <input type="password" id="password" placeholder="Mot de passe" />
    </div>

    <div class="form-group">
      <label for="mail">E-mail</label>
      <input type="email" id="mail" placeholder="E-mail" />
    </div>

    <button id="createUser" class="btn-primary">S'enregistrer</button>
  </div>
  `;

  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const mailInput = document.getElementById("mail") as HTMLInputElement;
  const createUserBtn = document.getElementById("createUser") as HTMLButtonElement;

  // 🔹 Ajout de la touche "Entrée" uniquement sur cette page
  const handleEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();           // évite toute action par défaut chelou
      createUserBtn.click();        // déclenche exactement la même logique
    }
  };

  usernameInput.addEventListener("keydown", handleEnter);
  passwordInput.addEventListener("keydown", handleEnter);
  mailInput.addEventListener("keydown", handleEnter);
  createUserBtn.addEventListener("keydown", handleEnter);

  // --- Créer un utilisateur ---
  createUserBtn.onclick = async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const mail = mailInput.value.trim();

    if (!username || !password || !mail) {
      alert("Merci d'entrer un username,un password et un mail");
      return;
    }

    if (!(validatePassword(password, username).ok)) {
      alert(validatePassword(password, username).reason);
      return;
    }

    if (!(validateEmail(mail).ok)) {
      alert(validateEmail(mail).reason);
      return;
    }

    console.log(null, 200, { user: username, password: password, mail: mail});
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, mail })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la création");
        return;
      }

      console.log("Utilisateur créé :", data);

      usernameInput.value = "";
      passwordInput.value = "";
      mailInput.value = "";

    } catch (err) {
      console.error(err);
    }
  };

  // --- Chargement initial ---;
}