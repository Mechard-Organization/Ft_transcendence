import { gamePage } from "./Game/gamePage";
import { resetBabylonJs } from "./ButtonsAndUI";
import { messagesPage } from "./messagesPage";
import { homePage } from "./Home/homePage";
import { usersPage } from "./UserManagement/registerPage";
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
    <a class="header_link" href="#user">Register</a>
    <a class="header_link" href="#messages">Messages</a>
    <a class="header_link" href="#user">User</a>
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
  
  const app = await buildHeader();
  if (!app)
    return;
  resetBabylonJs();

  if (page === "home") {
    homePage(app.innerHTML);
  } else if (page === "about") {
    app.innerHTML += "<h1>About</h1>";
  } else if (page === "game") {
    gamePage(app.innerHTML);
  } else if (page === "messages") {
    messagesPage(app.innerHTML);
  } else if (page === "user") {
    usersPage(app.innerHTML);
  } else if (page === "login") {
    loginPage(app.innerHTML);
  } else if (page === "profil") {
    profilPage(app.innerHTML);
  } else if (page === "profil") {
    profilPage(app.innerHTML);
  } else {
    app.innerHTML += "<h1>Page not found</h1>";
  }
}

// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
