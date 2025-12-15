import { pong } from "./Meshes";

export function gamePage(header: string, footer: string): void {

  app.innerHTML = `
    ${header}
    <main id="mainContent">
      <h1>Game</h1>
    </main>
    ${footer}
  `;
  pong();
}