import { gamePage } from "../Game/gamePage";
import { resetBabylonJs } from "../ButtonsAndUI";

// homePage.ts
export function homePage(header: string, footer: string) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = header;
  app.innerHTML += `
	<h1>Home</h1>

	<div>
	  <button id="game">Play</button>
	</div>
	</html>
  `;
  app.innerHTML += footer;
  const playBtn = document.getElementById("game") as HTMLButtonElement;

  playBtn.onclick = async () => {
	window.location.hash = "#game";
	resetBabylonJs();
	gamePage();
  }
}