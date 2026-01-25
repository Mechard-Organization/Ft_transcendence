
import { isAuthenticated } from "./authenticator";

type UserMe = {
  id: number;
  avatarUrl: string | null;
  twofa_enabled?: number;
};

async function loadMatch() {
  const tbody = document.getElementById("matchTableBody");
  if (!tbody) return;

  try {
    const auth = await isAuthenticated();
    if (!auth || !auth.authenticated) {
      tbody.innerHTML = `<tr><td colspan="3">Non connecté</td></tr>`;
      return;
    }
    const id = auth.authenticated && auth.id ? auth.id : 0;

    const user_res = await fetch("/api/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const user_data = await user_res.json();

    if (!user_res.ok) {
      alert(user_data.error || "Erreur lors de la création");
      return;
    }

    if (!user_data){
      alert("ce user n'existe pas");
      return;
    }

    const res = await fetch("/api/getMatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_player: user_data.username })
    });
    const matchs = await res.json();

    if (!res.ok || !Array.isArray(matchs)) {
      tbody.innerHTML = `<tr><td colspan="3">Erreur de chargement</td></tr>`;
      return;
    }
    if (matchs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">Aucun match</td></tr>`;
      return;
    }

    const rows = await Promise.all(
      matchs.map(async (match: any) => {
        let adv_name;
        let adv_score;
        let user_score;

        if (match.name_player1 == user_data.username) {
          user_score = match.score1;
          adv_score = match.score2;
          adv_name = match.name_player2;
        } else {
          user_score = match.score2;
          adv_score = match.score1;
          adv_name = match.name_player1;
        }

        return `
          <tr>
            <td>${match.date}</td>
            <td>${adv_name}</td>
            <td>${user_score} - ${adv_score}</td>
          </tr>
        `;
      })
    );

    tbody.innerHTML = rows.join("");

	} catch (err) {
		console.error(err);
		tbody.innerHTML = `<tr><td colspan="3">Erreur serveur</td></tr>`;
	}
}


export async function profilPage(header: string, footer: string) {
  const app = document.getElementById("app");
  const auth = await isAuthenticated();
  const id = auth.authenticated && auth.id ? auth.id : 0;

  if (!app || !auth) return;

  /* =====================
     FETCH USER PROFILE
  ===================== */

  let user: UserMe;

  try {
    const res = await fetch("/api/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    if (!res.ok) throw new Error("Failed to fetch user");

    user = await res.json();
  } catch (err) {
    console.error("User fetch error:", err);
    return;
  }
  const avatarSrc = user.avatarUrl ?? "/uploads/avatars/default.png";
  const twofaEnabled = user.twofa_enabled === 1;

  /* =====================
     RENDER
  ===================== */
  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1>Profil</h1>

      <!-- Avatar -->
      <section id="avatarSection" style="margin-bottom: 20px;">
        <img
          id="avatarImg"
          src="${avatarSrc}"
          alt="Avatar"
          width="128"
          height="128"
          style="
            border-radius: 50%;
            object-fit: cover;
            display: block;
            margin-bottom: 10px;
          "
        />

        <input
          type="file"
          id="avatarInput"
          accept="image/*"
          style="margin-bottom: 10px;"
        />

        <div>
          <button id="uploadAvatar" class="btn-primary">
            Changer la photo
          </button>
          <button id="deleteAvatar" class="btn-secondary">
            Supprimer la photo
          </button>
        </div>
      </section>

      <section id="twofaSection" style="margin-bottom: 20px;">
        <h2>2FA</h2>
        <p id="twofaStatus">${twofaEnabled ? "2FA active" : "2FA inactive"}</p>
        <button id="twofaSetup" class="btn-primary"${twofaEnabled ? " disabled" : ""}>
          Activer 2FA
        </button>
        <button id="twofaDisable" class="btn-secondary"${twofaEnabled ? "" : " style=\"display:none;\""}>
          Desactiver 2FA
        </button>
        <div id="twofaEnroll" style="display:none;">
          <img id="twofaQr" alt="QR 2FA" width="160" height="160" />
          <div class="form-group">
            <label for="twofaCode">Code de verification</label>
            <input type="text" id="twofaCode" placeholder="123456" />
          </div>
          <button id="twofaVerify" class="btn-primary">Valider</button>
          <p id="twofaError" style="color:red;"></p>
        </div>
      </section>

      <div>
        <button id="logout" class="btn-secondary">Logout</button>
      </div>
      <br />
      <div>
        <button id="del" class="btn-secondary">delete user</button>
      </div>
      <h1> liste des matchs</h1>
      <div class="table-container">
        <table id="matchTable">
          <thead>
            <tr	>
              <th>Date</th>
              <th>adversaire</th>
              <th>score</th>
            </tr>
          </thead>
          <tbody id="matchTableBody">
          <tr>
            <td colspan="3">Chargement...</td>
          </tr>
          </tbody>
        </table>
      </div>
    </main>
    ${footer}
  `;

  /* =====================
     AVATAR
  ===================== */

  const avatarImg = document.getElementById("avatarImg") as HTMLImageElement;
  const fileInput = document.getElementById("avatarInput") as HTMLInputElement;
  const uploadBtn = document.getElementById("uploadAvatar");
  const deleteAvatarBtn = document.getElementById("deleteAvatar");

  // Upload / remplacement
  uploadBtn?.addEventListener("click", async () => {
    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Choisis une image");
      return;
    }

    const file = fileInput.files[0];

    // Preview instantané
    avatarImg.src = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append("img", file);
    formData.append("id", String(id));

    try {
      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!res.ok) {
        alert("Erreur lors de l'upload");
        return;
      }

      const data = await res.json();

      // Cache busting
      avatarImg.src = `${data.avatarUrl}?t=${Date.now()}`;
    } catch (err) {
      console.error("Upload avatar error:", err);
    }
  });

  // Suppression avatar
  deleteAvatarBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/users/me/delavatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
      });

      if (!res.ok) {
        alert("Erreur lors de la suppression");
        return;
      }

      avatarImg.src = "/uploads/avatars/default.png";
    } catch (err) {
      console.error("Delete avatar error:", err);
    }
  });

  /* =====================
     2FA
  ===================== */

  const twofaSetupBtn = document.getElementById("twofaSetup") as HTMLButtonElement | null;
  const twofaDisableBtn = document.getElementById("twofaDisable") as HTMLButtonElement | null;
  const twofaEnroll = document.getElementById("twofaEnroll") as HTMLDivElement | null;
  const twofaQr = document.getElementById("twofaQr") as HTMLImageElement | null;
  const twofaCodeInput = document.getElementById("twofaCode") as HTMLInputElement | null;
  const twofaVerifyBtn = document.getElementById("twofaVerify") as HTMLButtonElement | null;
  const twofaStatus = document.getElementById("twofaStatus") as HTMLParagraphElement | null;
  const twofaError = document.getElementById("twofaError") as HTMLParagraphElement | null;

  twofaSetupBtn?.addEventListener("click", async () => {
    if (twofaError) twofaError.textContent = "";

    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (twofaError) twofaError.textContent = data.error || "Erreur 2FA.";
        return;
      }

      if (twofaQr) twofaQr.src = data.qr;
      if (twofaEnroll) twofaEnroll.style.display = "block";
    } catch (err) {
      console.error("2FA setup error:", err);
      if (twofaError) twofaError.textContent = "Erreur reseau.";
    }
  });

  twofaVerifyBtn?.addEventListener("click", async () => {
    if (!twofaCodeInput?.value) {
      if (twofaError) twofaError.textContent = "Code requis.";
      return;
    }

    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, code: twofaCodeInput.value.trim() })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (twofaError) twofaError.textContent = data.error || "Code invalide.";
        return;
      }

      if (twofaStatus) twofaStatus.textContent = "2FA active";
      if (twofaEnroll) twofaEnroll.style.display = "none";
      if (twofaSetupBtn) twofaSetupBtn.disabled = true;
      if (twofaDisableBtn) twofaDisableBtn.style.display = "inline-block";
    } catch (err) {
      console.error("2FA enable error:", err);
      if (twofaError) twofaError.textContent = "Erreur reseau.";
    }
  });

  twofaDisableBtn?.addEventListener("click", async () => {
    if (twofaError) twofaError.textContent = "";

    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (twofaError) twofaError.textContent = data.error || "Erreur 2FA.";
        return;
      }

      if (twofaStatus) twofaStatus.textContent = "2FA inactive";
      if (twofaEnroll) twofaEnroll.style.display = "none";
      if (twofaSetupBtn) twofaSetupBtn.disabled = false;
      if (twofaDisableBtn) twofaDisableBtn.style.display = "none";
    } catch (err) {
      console.error("2FA disable error:", err);
      if (twofaError) twofaError.textContent = "Erreur reseau.";
    }
  });

  /* =====================
     LOGOUT
  ===================== */

  document.getElementById("logout")?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        console.error("Logout failed");
        return;
      }

      window.location.hash = "#login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  });

  /* =====================
     DELETE USER
  ===================== */

  document.getElementById("del")?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/delUser", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auth.id })
      });

      if (!res.ok) {
        console.error("Delete user failed");
        return;
      }

      window.location.hash = "#login";
    } catch (err) {
      console.error("Delete user error:", err);
    }
  });
  loadMatch();
}
