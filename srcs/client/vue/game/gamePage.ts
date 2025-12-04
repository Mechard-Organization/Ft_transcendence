import { pong } from "./gameLogicAndMeshes";

export function gamePage(header: string, footer: string): void {

  app.innerHTML = header;
  app.innerHTML += `
  <h1>Game</h1>`;
  app.innerHTML += footer;
  pong();
}