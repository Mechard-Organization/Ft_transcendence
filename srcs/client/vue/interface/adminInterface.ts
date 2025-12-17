import { validatePassword, validateEmail } from "../../../services/validate.service.ts";
import { isAuthenticated } from "./authenticator";

export async function adminPage(header: string, footer: string) {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <div class="form-container">
        <h2 class="title">modifier votre nom d'utilisateur</h2>
        <div class="form-group">
          <label for="username">Nouveau nom d'utilisateur</label>
          <input type="text" id="username" placeholder="Nouveau nom d'utilisateur" />
        </div>
        <button id="updateUserUsername" class="btn-primary">Modifier</button>
      </div>
      <div class="form-container">
        <h2 class="title">modifier votre nom mot de passe</h2>
        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <input type="password" id="password" placeholder="Nouveau mot de passe" />
        </div>
        <button id="updateUserPassword" class="btn-primary">Modifier</button>
      </div>
      <div class="form-container">
        <h2 class="title">modifier votre e-mail</h2>
        <div class="form-group">
          <label for="mail">Nouveau e-mail</label>
          <input type="email" id="mail" placeholder="Nouveau e-mail" />
        </div>
        <button id="updateUserMail" class="btn-primary">Modifier</button>
      </div>
    </main>
    ${footer}
  `;

  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const updateUserUsernameBtn = document.getElementById("updateUserUsername") as HTMLButtonElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const updateUserPasswordBtn = document.getElementById("updateUserPassword") as HTMLButtonElement;
  const mailInput = document.getElementById("mail") as HTMLInputElement;
  const updateUserMailBtn = document.getElementById("updateUserMail") as HTMLButtonElement;

  const handleEnter = (button: HTMLButtonElement) => (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        button.click();
      }
    };

    usernameInput.addEventListener("keydown", handleEnter(updateUserUsernameBtn));
    updateUserUsernameBtn.addEventListener("keydown", handleEnter(updateUserUsernameBtn));
    passwordInput.addEventListener("keydown", handleEnter(updateUserPasswordBtn));
    updateUserPasswordBtn.addEventListener("keydown", handleEnter(updateUserPasswordBtn));
    mailInput.addEventListener("keydown", handleEnter(updateUserMailBtn));
    updateUserMailBtn.addEventListener("keydown", handleEnter(updateUserMailBtn));

    // --- Modifie l'utilisateur username ---
    updateUserUsernameBtn.onclick = async () => {
      const username = usernameInput.value.trim();
      const auth = await isAuthenticated();
      const id = auth ? auth.id : 0;

      if (!username || !id) {
        alert("Merci de vous connecter et d'entrer un username");
        return;
      }

      try {
        const res = await fetch("/api/updateUserUsername", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, id })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erreur lors de la création");
          return;
        }

        usernameInput.value = "";

      } catch (err) {
        console.error(err);
      }
    };

    // --- Modifie l'utilisateur password ---
    updateUserPasswordBtn.onclick = async () => {
      const password = passwordInput.value.trim();
      const auth = await isAuthenticated();
      const id = auth ? auth.id : 0;

      if (!password || !id) {
        alert("Merci de vous connecter et d'entrer un password");
        return;
      }

      try {
        const resuser = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });

        const datausername = await resuser.json();

        if (!resuser.ok) {
          alert(datausername.error || "Erreur lors de la création");
          return;
        }
        const username = datausername.username;
        if (!(validatePassword(password, username).ok)) {
          alert(validatePassword(password, username).reason);
          return;
        }

        const res = await fetch("/api/updateUserPassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, id })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erreur lors de la création");
          return;
        }

        passwordInput.value = "";

      } catch (err) {
        console.error(err);
      }
    };

    // --- Modifie l'utilisateur mail ---
    updateUserMailBtn.onclick = async () => {
      const mail = mailInput.value.trim();
      const auth = await isAuthenticated();
      const id = auth ? auth.id : 0;

      if (!mail || !id) {
        alert("Merci de vous connecter et d'entrer un mail");
        return;
      }

      try {
        if (!(validateEmail(mail).ok)) {
          alert(validateEmail(mail).reason);
          return;
        }

        const res = await fetch("/api/updateUserMail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail, id })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erreur lors de la création");
          return;
        }

        mailInput.value = "";

      } catch (err) {
        console.error(err);
      }
    };
}
