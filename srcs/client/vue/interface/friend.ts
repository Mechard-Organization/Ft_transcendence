import { isAuthenticated } from "./authenticator";
import { handleEnter } from "./adminInterface";

async function loadFriends() {
  const tbody = document.getElementById("friendTableBody");
  if (!tbody) return;

  try {
    const auth = await isAuthenticated();
    if (!auth) {
      tbody.innerHTML = `<tr><td colspan="4">Non connecté</td></tr>`;
      return;
    }

	const res = await fetch("/api/getFriendNV", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: auth.id })
		});
    const friends = await res.json();
	console.log(friends);

    if (!res.ok || !Array.isArray(friends)) {
      tbody.innerHTML = `<tr><td colspan="4">Erreur de chargement</td></tr>`;
      return;
    }
    if (friends.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">Aucun ami</td></tr>`;
      return;
    }

    tbody.innerHTML = friends.map((friend: any) => `
      <tr>
        <td>${friend.id}</td>
        <td>${friend.username}</td>
        <td>${friend.mail ?? "-"}</td>
		<td>
			<button class="btn-val" data-id="${friend.id}">accept</button>
		</td>
      </tr>
    `).join("");

	const valButtons = document.querySelectorAll<HTMLButtonElement>(".btn-val");

	valButtons.forEach((btn) => {
	btn.onclick = async () => {
		const id_friend = Number(btn.dataset.id);
		const auth = await isAuthenticated();
		const id_user = auth ? auth.id : 0;

		if (!id_friend || !id_user) return;

		try {
		const res = await fetch("/api/acceptFriend", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id_user, id_friend })
		});

		const data = await res.json();

		if (!res.ok) {
			alert(data.error || "Erreur lors de la suppression");
			return;
		}

		// Rafraîchir le tableau
		await loadFriends();

		} catch (err) {
		console.error(err);
		}
	};
	});

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3">Erreur serveur</td></tr>`;
  }
}


export function friendPage(header: string, footer: string) {
	const app = document.getElementById("app");

	if (!app) return;

	app.innerHTML = `
		${header}
		<main id="mainContent">
		<h2 class="title">vos amis</h2>
		<div class="form-container">
			<div class="form-group">
			<label for="id_friend">id ami</label>
			<input type="text" id="id_friend" placeholder="id ami" />
			</div>
			<button id="newFriend" class="btn-primary">Ajouter</button>
		</div>
		<div class="table-container">
			<table id="friendTable">
				<thead>
				<tr>
					<th>ID</th>
					<th>Nom d'utilisateur</th>
					<th>Email</th>
					<th>Accept</th>
				</tr>
				</thead>
				<tbody id="friendTableBody">
				<tr>
					<td colspan="4">Chargement...</td>
				</tr>
				</tbody>
			</table>
		</div>
		</main>
		${footer}
	`;

	const id_friendInput = document.getElementById("id_friend") as HTMLInputElement;
	const newFriendBtn = document.getElementById("newFriend") as HTMLButtonElement;

	id_friendInput.addEventListener("keydown", handleEnter(newFriendBtn));
    newFriendBtn.addEventListener("keydown", handleEnter(newFriendBtn));

	// --- Modifie l'utilisateur username ---
	newFriendBtn.onclick = async () => {
		const id_friend = Number(id_friendInput.value.trim());
		const auth = await isAuthenticated();
		const id_user = auth ? auth.id : 0;

		console.log(id_user, id_friend);
		if (!id_friend || !id_user) {
			alert("Merci de vous connecter et d'entrer un reel ami");
			return;
		}

		if (id_friend == id_user) {
			alert("Vous ne pouvez pas vous ajouter vous même");
			return;
		}

		try {
		const res = await fetch("/api/friend", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id_user, id_friend })
		});

		const data = await res.json();

		if (!res.ok) {
			alert(data.error || "Erreur lors de la création");
			return;
		}

		id_friendInput.value = "";
		await loadFriends();

		} catch (err) {
		console.error(err);
		}
	};
	loadFriends();
};
