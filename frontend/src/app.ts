import { gamePage } from "./gameLogicAndMeshes";
import { resetBabylonJs } from "./ButtonsAndUI";
import { messagesPage } from "./messagesPage";
import { usersPage } from "./usersPage";

const app = document.getElementById("app");

// main function that selects the page asked
function showPage(page: string) {
  const app = document.getElementById("app");
  if (!app) return;
  resetBabylonJs();
  app.innerHTML = "";

  if (page === "home") {
    app.innerHTML = "<h1>Home</h1>";
  } else if (page === "about") {
    app.innerHTML = "<h1>About</h1>";
  } else if (page === "game") {
    gamePage();
  } else if (page === "messages") {
    messagesPage();
  } else if (page === "user") {
    usersPage();
  } else {
    app.innerHTML = "<h1>Page not found</h1>";
  }
}

// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
