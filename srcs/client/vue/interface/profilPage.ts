//


import { isAuthenticated } from "./authenticator";

type UserMe = {
  id: number;
  avatarUrl: string | null;
};

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
  const avatarSrc =
    user.avatarUrl ?? "/uploads/avatars/default.png";

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

      <div>
        <button id="logout" class="btn-secondary">Logout</button>
      </div>
      <br />
      <div>
        <button id="del" class="btn-secondary">delete user</button>
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
}
