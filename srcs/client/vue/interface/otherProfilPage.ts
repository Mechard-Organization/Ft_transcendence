
import { isAuthenticated } from "./authenticator";

type UserMe = {
  id: number;
  avatarUrl: string | null;
};

async function loadMatch() {
  const tbody = document.getElementById("matchTableBody");
  if (!tbody) return;

  try {
    // const auth = await isAuthenticated();
    // const id = auth.authenticated && auth.id ? auth.id : 0;
    const currentHref = location.hash.slice(1);
    const subHref = currentHref.split('#');

    const user_res = await fetch("/api/getuserbyname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: subHref[1] })
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
            <td><a href="#profil#${adv_name}">${adv_name}</a></td>
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


export async function otherProfilPage(header: string, footer: string) {
  const app = document.getElementById("app");
  const currentHref = location.hash.slice(1);
  const subHref = currentHref.split('#');
  // const auth = await isAuthenticated();
  // const id = auth.authenticated && auth.id ? auth.id : 0;

  if (!app) return;

  /* =====================
     FETCH USER PROFILE
  ===================== */

  let user: UserMe;

  try {
    const res = await fetch("/api/getuserbyname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: subHref[1] })
    });

    // const res = await fetch("/api/getuser", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ id })
    // });

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
      </section>

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
  loadMatch();
}
