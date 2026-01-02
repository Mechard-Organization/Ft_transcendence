import { isAuthenticated } from "./authenticator";
import { handleEnter } from "./adminInterface";

async function loadRequestFriends() {
  const tbody = document.getElementById("requestTableBody");
  if (!tbody) return;

  try {
    const auth = await isAuthenticated();
    if (!auth || !auth.authenticated) {
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
      tbody.innerHTML = `<tr><td colspan="4">Aucune requête d'ami</td></tr>`;
      return;
    }

    tbody.innerHTML = friends.map((friend: any) => `
      <tr>
        <td>${friend.id}</td>
        <td>${friend.username}</td>
        <td>${friend.mail ?? "-"}</td>
		<td>
			${friend.id_sender == friend.id
				? `<button class="btn-val" data-id="${friend.id}">accept</button>`
				: `en attente`
			}
			<button class="btn-del" data-id="${friend.id}">reject</button>
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
					alert(data.error || "Erreur lors de l'acceptation");
					return;
				}

				// Rafraîchir le tableau
				await loadRequestFriends();
				await loadFriends();

			} catch (err) {
			console.error(err);
			}
		};
	});

	const delButtons = document.querySelectorAll<HTMLButtonElement>(".btn-del");

	delButtons.forEach((btn) => {
		btn.onclick = async () => {
			const id_friend = Number(btn.dataset.id);
			const auth = await isAuthenticated();
			const id_user = auth ? auth.id : 0;

			if (!id_friend || !id_user) return;

			try {
				const res = await fetch("/api/delFriend", {
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
				await loadRequestFriends();

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

async function loadFriends() {
  const tbody = document.getElementById("friendTableBody");
  if (!tbody) return;

  	try {
		const auth = await isAuthenticated();
		if (!auth || !auth.authenticated) {
		tbody.innerHTML = `<tr><td colspan="4">Non connecté</td></tr>`;
		return;
		}

		const res = await fetch("/api/getFriendV", {
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
			<td><button class="btn-del" data-id="${friend.id}">reject</button></td>
		</tr>
		`).join("");


		const delButtons = document.querySelectorAll<HTMLButtonElement>(".btn-del");

		delButtons.forEach((btn) => {
			btn.onclick = async () => {
				const id_friend = Number(btn.dataset.id);
				const auth = await isAuthenticated();
				const id_user = auth ? auth.id : 0;

				if (!id_friend || !id_user) return;

				try {
					const res = await fetch("/api/delFriend", {
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
		tbody.innerHTML = `<tr><td colspan="4">Erreur serveur</td></tr>`;
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
			<label for="friend">username</label>
			<input type="text" id="friend" placeholder="username" />
			</div>
			<button id="newFriend" class="btn-primary">Ajouter</button>
		</div>
		</br>
		<h1> requête d'ami</h1>
		<div class="table-container">
			<table id="requestTable">
				<thead>
					<tr	>
						<th>ID</th>
						<th>Nom d'utilisateur</th>
						<th>Email</th>
						<th>Accept</th>
					</tr>
				</thead>
				<tbody id="requestTableBody">
				<tr>
					<td colspan="4">Chargement...</td>
				</tr>
				</tbody>
			</table>
		</div>
		<h1> liste d'ami</h1>
		<div class="table-container">
			<table id="friendTable">
				<thead>
					<tr	>
						<th>ID</th>
						<th>Nom d'utilisateur</th>
						<th>Email</th>
						<th>reject</th>
					</tr>
				</thead>
				<tbody id="friendTableBody">
				<tr>
					<td colspan="3">Chargement...</td>
				</tr>
				</tbody>
			</table>
		</div>
		</main>
		${footer}
	`;

	const friendInput = document.getElementById("friend") as HTMLInputElement;
	const newFriendBtn = document.getElementById("newFriend") as HTMLButtonElement;

	friendInput.addEventListener("keydown", handleEnter(newFriendBtn));
    newFriendBtn.addEventListener("keydown", handleEnter(newFriendBtn));

	// --- WEBSOCKET ---
	const ws = new WebSocket("/ws/");

	ws.onopen = () => {
		console.log("WebSocket connecté !");
		ws.send(
			JSON.stringify({
				type: "wsFriend"
			})
		);
	};

	ws.onmessage = (event) => {
		try {
			const msg = JSON.parse(event.data);

			if (msg.type === "friend") {
				loadFriends();
				loadRequestFriends();
			}
		} catch (e) {
			console.error("Erreur WS:", e);
		}
	};

	ws.onclose = () => {
		console.log("WebSocket déconnecté");
	};

	// --- Modifie l'utilisateur username ---
	newFriendBtn.onclick = async () => {
		const username_friend = friendInput.value.trim();
		const auth = await isAuthenticated();
		const id_user = auth ? auth.id : 0;

		try
		{
			const friend_res = await fetch("/api/getuserbyname", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: username_friend })
			});

			const friend_data = await friend_res.json();

			if (!friend_res.ok) {
				alert(friend_data.error || "Erreur lors de la création");
				return;
			}

			if (!friend_data){
				alert("ce user n'existe pas");
				return;
			}

			const id_friend = friend_data.id;
			console.log(id_user, id_friend);
			if (!id_friend || !id_user) {
				alert("Merci de vous connecter et d'entrer un reel ami");
				return;
			}

			if (id_friend == id_user) {
				alert("Vous ne pouvez pas vous ajouter vous même");
				return;
			}

			const res = await fetch("/api/friend", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id_user, id_friend, id_sender: id_user })
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || "Erreur lors de la création");
				return;
			}

			friendInput.value = "";
			await loadRequestFriends();
			await loadFriends();

		} catch (err) {
		console.error(err);
		}
	};
	loadRequestFriends();
	loadFriends();
};
