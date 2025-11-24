// loginPage.ts
export function loginPage() {
  const app = document.getElementById("app");
  if (!app) return;
  
  app.innerHTML = `
  <h1>Login</h1>

  <div>
    <button id="signUp">Sign up</button>
  </div>
  `;
}