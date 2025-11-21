// usersPage.ts
export function usersPage() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <h1>Users</h1>

    <div>
      <input type="text" id="username" placeholder="Nom d'utilisateur" />
      <input type="password" id="password" placeholder="Mot de passe" />
      <button id="createUser">Créer utilisateur</button>
    </div>

    <h2>Liste des utilisateurs</h2>
    <ul id="usersList"></ul>
  `;

  const usersList = document.getElementById("usersList") as HTMLUListElement;
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const createUserBtn = document.getElementById("createUser") as HTMLButtonElement;

  // --- Fonction pour récupérer tous les utilisateurs ---
  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      usersList.innerHTML = "";

      data.forEach((user: { id: number; username: string }) => {
        const li = document.createElement("li");
        li.textContent = `#${user.id}: ${user.username}`;
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

    if (!username || !password) {
      alert("Merci d'entrer un username et un password");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la création");
        return;
      }

      console.log("Utilisateur créé :", data);

      usernameInput.value = "";
      passwordInput.value = "";

      fetchUsers(); // Rafraîchir la liste
    } catch (err) {
      console.error(err);
    }
  };

  // --- Chargement initial ---
  fetchUsers();
}
