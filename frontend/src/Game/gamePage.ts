import { pong } from "./gameLogicAndMeshes";

export function gamePage(header: string): void {

  app.innerHTML = header;
  app.innerHTML += `
  <h1>Game</h1>`;
  pong();
}