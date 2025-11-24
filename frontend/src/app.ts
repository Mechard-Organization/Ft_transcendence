import { gamePage } from "./gameLogicAndMeshes";
import { resetBabylonJs } from "./ButtonsAndUI";
import { messagesPage } from "./messagesPage";
import { homePage } from "./homePage";
import { usersPage } from "./UserManagement/usersPage";
import { loginPage } from "./UserManagement/loginPage";


const app = document.getElementById("app");

// main function that selects the page asked
function showPage(page: string) {
  const app = document.getElementById("app");
  if (!app) return;
  resetBabylonJs();
  app.innerHTML = "";

  if (page === "home") {
    window.location.hash = "#home";
    homePage();
  } else if (page === "about") {
    app.innerHTML = "<h1>About</h1>";
  } else if (page === "game") {
    window.location.hash = "#game";
    gamePage();
  } else if (page === "messages") {
    window.location.hash = "#messages";
    messagesPage();
  } else if (page === "user") {
    window.location.hash = "#user";
    usersPage();
  } else if (page === "login") {
    window.location.hash = "#login";
    loginPage();
  } else {
    app.innerHTML = "<h1>Page not found</h1>";
  }
}

// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
