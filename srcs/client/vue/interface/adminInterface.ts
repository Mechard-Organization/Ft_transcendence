
export async function adminPage(header: string, footer: string) {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
    ${header}
    <main id="mainContent">
    </main>
    ${footer}
  `;
}
