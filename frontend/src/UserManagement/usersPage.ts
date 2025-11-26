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

// usersPage.ts
export function usersPage(header: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = header;
  app.innerHTML += `
    <h1>Users</h1>

    <div>
      <input type="text" id="username" placeholder="Nom d'utilisateur" />
      <input type="password" id="password" placeholder="Mot de passe" />
      <input type="mail" id="mail" placeholder="E-mail" />
      <button id="createUser">Créer utilisateur</button>
    </div>

    <h2>Liste des utilisateurs</h2>
    <ul id="usersList"></ul>
  `;

  const usersList = document.getElementById("usersList") as HTMLUListElement;
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const mailInput = document.getElementById("mail") as HTMLInputElement;
  const createUserBtn = document.getElementById("createUser") as HTMLButtonElement;

  // --- Fonction pour récupérer tous les utilisateurs ---
  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      usersList.innerHTML = "";

      data.forEach((user: { id: number; username: string; mail: string}) => {
        const li = document.createElement("li");
        li.textContent = `#${user.id}: ${user.username}, ${user.mail}`;
        usersList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      usersList.innerHTML = "<li>Erreur lors du chargement des utilisateurs</li>";
    }
  }

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

      fetchUsers(); // Rafraîchir la liste
    } catch (err) {
      console.error(err);
    }
  };

  // --- Chargement initial ---
  fetchUsers();
}
