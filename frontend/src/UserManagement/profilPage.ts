export function profilPage(header: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = header;
  app.innerHTML += `
    <h1>Profil</h1>
  `;
  }