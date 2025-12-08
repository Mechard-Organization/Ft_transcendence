import { gamePage } from "../client/vue/game/gamePage";
import { resetBabylonJs } from "../client/vue/ts/UI";
import { messagesPage } from "../client/vue/messages/messagesPage";
import { homePage } from "../client/vue/home/homePage";
import { registerPage } from "../client/vue/interface/registerPage";
import { loginPage } from "../client/vue/interface/loginPage";
import { profilPage } from "../client/vue/interface/profilPage"
import { isAuthenticated } from "../client/vue/interface/authenticator";

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
    </body>`;
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
  <div class="footer">
  <div class="footer_links">
  <a class="footer_link" href="#about">About</a></div>
  </div>
  </div>
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
