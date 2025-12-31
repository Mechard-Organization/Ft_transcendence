import { isAuthenticated } from "./authenticator";
import { handleEnter } from "./adminInterface";


export async function adminOnlyPage(header: string, footer: string) {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
		${header}
		<main id="mainContent">
			<h1>welcome admin</h1>
			<h2>add admin</h2>
			<div class="form-container">
				<div class="form-group">
					<label for="admin">username</label>
					<input type="text" id="admin" placeholder="username" />
				</div>
				<button id="newAdmin" class="btn-primary">Ajouter</button>
			</div>
			<h2>sup admin</h2>
			<div class="form-container">
				<div class="form-group">
					<label for="supAdmin">username</label>
					<input type="text" id="supAdmin" placeholder="username" />
				</div>
				<button id="supAdminb" class="btn-primary">Supprimer</button>
			</div>
		</main>
		${footer}
	`;

	const adminInput = document.getElementById("admin") as HTMLInputElement;
	const newAdminBtn = document.getElementById("newAdmin") as HTMLButtonElement;

	adminInput.addEventListener("keydown", handleEnter(newAdminBtn));
	newAdminBtn.addEventListener("keydown", handleEnter(newAdminBtn));

	newAdminBtn.onclick = async () => {
		const username = adminInput.value.trim();
		const auth = await isAuthenticated();
		const id_user = auth ? auth.id : 0;

		try
		{
			const admin_res = await fetch("/api/getuserbyname", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username })
			});

			const admin_data = await admin_res.json();

			if (!admin_res.ok) {
				alert(admin_data.error || "Erreur lors de la création");
				return;
			}

			if (!admin_data){
				alert("ce user n'existe pas");
				return;
			}

			const id = admin_data.id;
			if (!id || !id_user) {
				alert("Merci de vous connecter et d'entrer un reel user");
				return;
			}

			if (id == id_user) {
				alert("Vous ne pouvez pas vous ajouter vous même");
				return;
			}

			const res = await fetch("/api/updateUserAdmin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status: true})
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || "Erreur lors de la création");
				return;
			}

			adminInput.value = "";

		} catch (err) {
			console.error(err);
		}
	};

	const supAdminInput = document.getElementById("supAdmin") as HTMLInputElement;
	const supAdminBtn = document.getElementById("supAdminb") as HTMLButtonElement;


	supAdminInput.addEventListener("keydown", handleEnter(supAdminBtn));
	supAdminBtn.addEventListener("keydown", handleEnter(supAdminBtn));

	supAdminBtn.onclick = async () => {
		const username = supAdminInput.value.trim();
		const auth = await isAuthenticated();
		const id_user = auth ? auth.id : 0;

		try
		{
			const admin_res = await fetch("/api/getuserbyname", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username })
			});

			const admin_data = await admin_res.json();

			if (!admin_res.ok) {
				alert(admin_data.error || "Erreur lors de la création");
				return;
			}

			if (!admin_data){
				alert("ce user n'existe pas");
				return;
			}

			const id = admin_data.id;
			if (!id || !id_user) {
				alert("Merci de vous connecter et d'entrer un reel user");
				return;
			}

			if (id == id_user) {
				alert("Vous ne pouvez pas vous ajouter vous même");
				return;
			}

			const res = await fetch("/api/updateUserAdmin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, status: false})
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || "Erreur lors de la création");
				return;
			}

			supAdminInput.value = "";

		} catch (err) {
			console.error(err);
		}
	};
}
