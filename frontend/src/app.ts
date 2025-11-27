import { gamePage } from "./Game/gamePage";
import { resetBabylonJs } from "./ButtonsAndUI";
import { messagesPage } from "./messagesPage";
import { homePage } from "./Home/homePage";
import { registerPage } from "./UserManagement/registerPage";
import { loginPage } from "./UserManagement/loginPage";
import { profilPage } from "./UserManagement/profilPage"
import { isAuthenticated } from "./UserManagement/authenticator";

async function buildHeader() {
  const app = document.getElementById("app");
  if (!app) return null;

  const auth = await isAuthenticated();
  if (!auth.authenticated) {
    app.innerHTML = `
    <body>
    <div class="header">
    <div class="header_links">
    <a class="header_link" href="#home">Home</a>
    <a class="header_link" href="#login">Login</a>
    <a class="header_link" href="#messages">Messages</a>
    <a class="header_link" href="#register">Register</a>
    <a class="header_link" href="#about">About</a>
    </div>
    </div>
    </body>
    <div class="footer"><p class="footer_text">this is my footer</p></div>`;
  } else {
    app.innerHTML = `
    <body>
    <div class="header">
    <div class="header_links">
    <a class="header_link" href="#home">Home</a>
    <a class="header_link" href="#messages">Messages</a>
    <a class="header_link" href="#profil">Profil</a>
    <a class="header_link" href="#about">About</a>
    </div>
    </div>
    </body>`;
  }
  return app;
}

// main function that selects the page asked
async function showPage(page: string) {
  
  const footer = `
  <div class="footer"><p class="footer_text">this is my footer</p></div>
  `;
  const app = await buildHeader();
  if (!app)
    return;
  resetBabylonJs();

  if (page === "home") {
    homePage(app.innerHTML, footer);
  } else if (page === "about") {
    app.innerHTML += "<h1>About</h1>";
  } else if (page === "game") {
    gamePage(app.innerHTML, footer);
  } else if (page === "messages") {
    messagesPage(app.innerHTML, footer);
  } else if (page === "register") {
    registerPage(app.innerHTML, footer);
  } else if (page === "login") {
    loginPage(app.innerHTML, footer);
  } else if (page === "profil") {
    profilPage(app.innerHTML, footer);
  } else {
    app.innerHTML += "<h1>Page not found</h1>";
  }
}

// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
