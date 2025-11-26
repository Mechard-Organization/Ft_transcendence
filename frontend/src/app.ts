import { gamePage } from "./Game/gamePage";
import { resetBabylonJs } from "./ButtonsAndUI";
import { messagesPage } from "./messagesPage";
import { homePage } from "./Home/homePage";
import { usersPage } from "./UserManagement/usersPage";
import { loginPage } from "./UserManagement/loginPage";
import { profilPage } from "./UserManagement/profilPage"


const app = document.getElementById("app");

function buildPage(page: string) {
  const app = document.getElementById("app");
  if (!app) return;
  resetBabylonJs();
  app.innerHTML = `
  <body>
    <div class="header">
      <div class="header_links">
        <a class="header_link" href="#home">Home</a>
        <a class="header_link" href="#login">Login</a>
        <a class="header_link" href="#messages">Messages</a>
        <a class="header_link" href="#user">User</a>
        <a class="header_link" href="#about">About</a>
      </div>
    </div>
    <div id="app"></div>
    <div class="footer"><p class="footer_text">this is my footer</p></div>
    <script type="module" src="app.ts"></script>
  </body>`;

  if (page === "home") {
    window.location.hash = "#home";
    homePage(app.innerHTML);
  } else if (page === "about") {
    app.innerHTML += "<h1>About</h1>";
  } else if (page === "game") {
    window.location.hash = "#game";
    gamePage(app.innerHTML);
  } else if (page === "messages") {
    window.location.hash = "#messages";
    messagesPage(app.innerHTML);
  } else if (page === "user") {
    window.location.hash = "#user";
    usersPage(app.innerHTML);
  } else if (page === "login") {
    window.location.hash = "#login";
    loginPage(app.innerHTML);
  } else if (page === "profil") {
    window.location.hash = "#profil";
    profilPage(app.innerHTML);
  } else {
    app.innerHTML += "<h1>Page not found</h1>";
  }
}

// main function that selects the page asked
function showPage(page: string) {
  const app = document.getElementById("app");
  if (!app) return;
  resetBabylonJs();
  app.innerHTML = `
  <body>
    <div class="header">
      <div class="header_links">
        <a class="header_link" href="#home">Home</a>
        <a class="header_link" href="#messages">Messages</a>
        <a class="header_link" href="#user">User</a>
        <a class="header_link" href="#about">About</a>
        <a class="header_link" href="#profil">Profil</a>
      </div>
    </div>
    <div id="app"></div>
    <div class="footer"><p class="footer_text">this is my footer</p></div>
    <script type="module" src="app.ts"></script>
  </body>`;

  if (page === "profil") {
    window.location.hash = "#profil";
    profilPage(app.innerHTML);
  } else {
    buildPage(page);
  }
}

// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
