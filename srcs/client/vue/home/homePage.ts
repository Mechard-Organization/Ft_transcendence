import { gamePage } from "../game/gamePage";
import { resetBabylonJs } from "../ts/UI";

// homePage.ts
export function homePage(header: string, footer: string) {
  const app = document.getElementById("app");
  if (!app) return;

 app.innerHTML = `
    ${header}
    <main id="mainContent">
	    <h1>Home</h1>

	    <div>
	      <button id="game" class="btn-standard">Play</button>
	    </div>
    ${footer}
  `;
  const playBtn = document.getElementById("game") as HTMLButtonElement;

  playBtn.onclick = async () => {
	window.location.hash = "#game";
	resetBabylonJs();
	gamePage();
  }
}