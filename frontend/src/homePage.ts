import { gamePage } from "./gameLogicAndMeshes";

// homePage.ts
export function homePage() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
	<h1>Home</h1>

	<div>
	  <button id="game">Play</button>
	</div>
  `;

  const playBtn = document.getElementById("game") as HTMLButtonElement;

  playBtn.onclick = async () => {
	window.location.hash = "#game";
	gamePage();
  }
}