/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Meshes.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/09 14:01:28 by ajamshid          #+#    #+#             */
/*   Updated: 2026/01/27 16:14:55 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PointerDragBehavior, Texture, Color4, ParticleSystem, KeyboardEventTypes, TrailMesh, Color3, FreeCamera, StandardMaterial, Engine, Scene, ArcRotateCamera, HemisphericLight, PointLight, MeshBuilder, Vector3 } from "@babylonjs/core";
import { movePaddlesAndBalls } from "../../../server/gameLogic";
import { createUI, drawText, setPlayerName, createdisposableUI, finalGoal, resetGame } from "../ts/UI";
import { isAuthenticated } from "../interface/authenticator";
let engine: Engine | null = null;
export let scene: Scene | null = null;
export let dragPos1 = new Vector3(0, 0, 0);
export let isDragging1 = false;
export let dragPos2 = new Vector3(0, 0, 0);
export let isDragging2 = false;
export let counter = [0, 0];
export let username: string | null = null;
let usernameLoaded = false;
let usernameWait = 0;
export let thisNewGame: NewGame | undefined = undefined;
let ws:any = undefined;


const paddleWidth = 10, paddleHeight = 100;
const wallHeight = 20;

export function nullifySceneEngine() {
  if (engine) {
    engine.dispose?.();
    engine = null;
  }
  if (scene) {
    scene.dispose?.();
    scene = null;
  }
  ws?.close();
}
interface Vec3 {
  x: number,
  y: number,
  z: number
}

interface Paddles {
  paddle1: number;
  paddle2: number;
}

interface Talker {
  type: "talker",
  gameId: number,
  paddles: Paddles,
  ballpos: Vec3,
  counter: number[],
  playername: string[],
  playerCount: number,
  wallTop?: boolean,
  wallbottom?: boolean,
  wallright?: boolean,
  wallleft?: boolean
}

interface Player {
  type: "Player",
  username: string | undefined,
  gameId?: number,
  keys: any,
  pause: number,
  isDragging1: boolean,
  isDragging2: boolean,
  dragPos1: Vec3,
  dragPos2: Vec3,
  ws?: WebSocket
}

interface NewGame {
  type: "newGame",
  playerCount: number,
  mode: number,
  gameId?: number,
  playername: string[]
}

export interface Settings {
  tableMat: Color3,
  paddleMat: Color3,
  ballMat: Color3,
  wallMat: Color3,
  lightIntensity: number,
  colorType: number
}
export const defaultSettings: Settings = {
  tableMat: new Color3(0, 0.5, 0),
  paddleMat: new Color3(0.1, 0.1, 0.1),
  ballMat: new Color3(0.5, 0, 0),
  wallMat: new Color3(0.5, 0.5, 0.5),
  lightIntensity: 0,
  colorType: 0,
};

export function setNewGame(newGameGiven: NewGame) {
  thisNewGame = newGameGiven;
  // console.log("newgame set with ", thisNewGame.type);
}

async function saveValues(input: Talker, counter: number[])
{
  const resuser = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name_player1: input.playername[0], name_player2: input.playername[1], score1: counter[0], score2: counter[1] })
  });
}

export function setValues(input: Talker | undefined) {
  if (input == undefined)
    return;
  counter = [...input.counter];
  setPlayerName([...input.playername]);
  drawText();
  if (input.playerCount > 0 && (counter[0] == finalGoal || counter[1] == finalGoal)) {
    saveValues(input, counter);
    thisPlayer.gameId = undefined;
    // console.log(thisPlayer.gameId);
    createdisposableUI(0);
    return;
  }
  // console.log("setVAlues called");
  scene.getMeshByName("paddle1").position.z = input.paddles.paddle1;
  scene.getMeshByName("paddle2").position.z = input.paddles.paddle2;
  scene.getMeshByName("ball").position = new Vector3(input.ballpos.x, input.ballpos.y, input.ballpos.z);
  thisPlayer.gameId = input.gameId;
}



export const keys: { [key: string]: boolean } = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
export const canvas = document.createElement("canvas");
canvas.id = "gameCanvas";
canvas.width = 800;
canvas.height = 600;
canvas.style.background = "black";
canvas.style.display = "block";
canvas.style.margin = "0 auto";

function createMeshes(scene: any) {
  // Mats for Meshes

  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.emissiveColor = defaultSettings.tableMat.clone();
  tableMat.diffuseColor = new Color3(0, 0, 0);

  const paddleMat = new StandardMaterial("paddleMat", scene);
  paddleMat.emissiveColor = defaultSettings.paddleMat.clone();
  paddleMat.diffuseColor = new Color3(0, 0, 0);

  const ballMat = new StandardMaterial("ballMat", scene);
  ballMat.emissiveColor = defaultSettings.ballMat.clone();
  ballMat.diffuseColor = new Color3(0, 0, 0);

  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.emissiveColor = defaultSettings.wallMat.clone();
  wallMat.diffuseColor = new Color3(0, 0, 0);


  // --------------------------------------------
  // --------------------------------------------

  // table
  const table = MeshBuilder.CreateGround("table", { width: canvas.width, height: canvas.height }, scene);
  table.material = tableMat;

  // paddles
  const paddle1 = MeshBuilder.CreateBox("paddle1", { width: paddleWidth, height: 40, depth: paddleHeight }, scene);
  paddle1.position = new Vector3(canvas.width / 2 - 20, 20, 0);
  paddle1.refreshBoundingInfo();
  paddle1.material = paddleMat;
  // paddle1.showBoundingBox = true;

  const paddle2 = paddle1.clone("paddle2");
  paddle2.position.x = -(canvas.width / 2) + 20;
  paddle2.refreshBoundingInfo();
  // paddle2.showBoundingBox = true;

  paddle1.addBehavior(drag1);
  drag1.moveAttached = false;
  paddle2.addBehavior(drag2);
  drag2.moveAttached = false;

  // Ball
  const ball = MeshBuilder.CreateSphere("ball", { diameter: (10 * 2) }, scene);
  ball.position = new Vector3(0, 10 + 1, 0);
  ball.refreshBoundingInfo();
  ball.material = ballMat;
  // ball.showBoundingBox = true;


  //walls and line
  const wallLeft = MeshBuilder.CreateBox("wallLeft", { width: 10, height: wallHeight, depth: canvas.height }, scene);
  wallLeft.position = new Vector3(canvas.width / 2 + 5, wallHeight / 2, 0);
  wallLeft.refreshBoundingInfo();
  wallLeft.material = wallMat;

  const wallRight = MeshBuilder.CreateBox("wallRight", { width: 10, height: wallHeight, depth: canvas.height }, scene);
  wallRight.position = new Vector3(-canvas.width / 2 - 5, wallHeight / 2, 0);
  wallRight.refreshBoundingInfo();
  wallRight.material = wallMat;

  const middleLine = MeshBuilder.CreateBox("middleLine", { width: 10, height: 0, depth: canvas.height }, scene);
  middleLine.position = new Vector3(0, 0, 0);
  middleLine.refreshBoundingInfo();
  middleLine.material = wallMat;

  const wallTop = MeshBuilder.CreateBox("wallTop", { width: canvas.width + 20, height: wallHeight, depth: 10 }, scene);
  wallTop.position = new Vector3(0, wallHeight / 2, -canvas.height / 2 - 5);
  wallTop.refreshBoundingInfo();
  wallTop.material = wallMat;

  const wallBottom = MeshBuilder.CreateBox("wallBottop", { width: canvas.width + 20, height: wallHeight, depth: 10 }, scene);
  wallBottom.position = new Vector3(0, wallHeight / 2, canvas.height / 2 + 5);
  wallBottom.refreshBoundingInfo();
  wallBottom.material = wallMat;

  const particleSystem = new ParticleSystem("trail", 2000, scene);
  particleSystem.particleTexture = new Texture("textures/flare.png", scene);
  particleSystem.emitter = ball;
  particleSystem.minSize = 1;
  particleSystem.maxSize = 15;
  particleSystem.emitRate = 1000;
  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.3;
  particleSystem.start();

}
function createScene(engine: any) {
  const scene = new Scene(engine);
  // Camera
  const camera = new FreeCamera("camera", new Vector3(0, canvas.width, canvas.height), scene);
  camera.setTarget(Vector3.Zero());
  // camera.attachControl(canvas, true);
  // Light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = defaultSettings.lightIntensity;
  return scene;
};

const drag1 = new PointerDragBehavior({
  dragAxis: new Vector3(0, 0, 1)
});
drag1.onDragObservable.add((event: any) => {
  dragPos1.copyFrom(event.dragPlanePoint);
});
drag1.onDragStartObservable.add(() => {
  isDragging1 = true;
  // console.log("is dragging 1");
});

drag1.onDragEndObservable.add(() => {
  isDragging1 = false;
  // console.log("is dragging 11");
});

const drag2 = new PointerDragBehavior({
  dragAxis: new Vector3(0, 0, 1)
});
drag2.onDragObservable.add((event: any) => {
  dragPos2.copyFrom(event.dragPlanePoint);
});
drag2.onDragStartObservable.add(() => {
  isDragging2 = true;
  // console.log("is dragging 2");
});

drag2.onDragEndObservable.add(() => {
  isDragging2 = false;
  // console.log("is dragging 21");
});

export let thisPlayer: Player = {
  type: "Player",
  username: username,
  keys: keys,
  pause: 0,
  isDragging1: isDragging1,
  isDragging2: isDragging2,
  dragPos1: { x: dragPos1.x, y: dragPos1.y, z: dragPos1.z },
  dragPos2: { x: dragPos2.x, y: dragPos2.y, z: dragPos2.z }
}

function setThisPlayer() {
  thisPlayer.username = username,
    thisPlayer.keys = keys,
    thisPlayer.pause = thisPlayer.pause,
    thisPlayer.isDragging1 = isDragging1,
    thisPlayer.isDragging2 = isDragging2,
    thisPlayer.dragPos1 = { x: dragPos1.x, y: dragPos1.y, z: dragPos1.z },
    thisPlayer.dragPos2 = { x: dragPos2.x, y: dragPos2.y, z: dragPos2.z }
}

async function loadUsernameFromCookie() {

  try {
    const auth = await isAuthenticated();
    const id = auth ? auth.id : 0;

    if (!id)
    {
      thisPlayer.username = undefined;
      username = null;
      usernameLoaded = false;
      return;
    }

    if (usernameLoaded) return;

    usernameLoaded = true;

    const resuser = await fetch("/api/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const datauser = await resuser.json();

    if (!resuser.ok) {
      alert(datauser.error || "Erreur lors de la création");
      return;
    }
    if (datauser.username) {
      thisPlayer.username = datauser.username;
      username = datauser.username;
    }
  } catch (err) {
    console.warn("No cookie username");
  }
}

export async function pong(): Promise<string> {
  await loadUsernameFromCookie();
  ws = new WebSocket("/ws/");
  const app = document.getElementById("app")!;

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "wsMessage",
        player: thisPlayer,
        newGame: thisNewGame
      })
    );
  };

  ws.onmessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      console.warn("Received non-JSON message:", event.data);
      return;
    }
    if (message.type === "Playername") {
      if (!username) {
        thisPlayer.username = message.username;
        username = message.username;
      }
      console.log("user name is set to ", thisPlayer.username);
    }
    if (message.type === "talker") {
      setValues(message);
    }

    if (message.type === "welcome")
      console.log(message)
  };

  ws.onerror = (err) => {
    console.error("WebSocket error", err);
  };

  ws.onclose = () => {
    // console.log("WebSocket closed");
  };

  resetGame();


  function play() {
    if (!app.contains(canvas)) app.appendChild(canvas);

    engine = new Engine(canvas, true);
    scene = createScene(engine);

    createMeshes(scene);
    resetGame(scene);
    createUI();
    drawText();
    let lastSend = 0;
    const SEND_INTERVAL = 50; // ms = 20 fois/sec

    engine.runRenderLoop(() => {
      scene.render();

      const now = performance.now();
      if (
        ws.readyState === WebSocket.OPEN &&
        username &&
        now - lastSend > SEND_INTERVAL
      ) {
        lastSend = now;

        setThisPlayer();
        ws.send(JSON.stringify({
          type: "wsMessage",
          player: thisPlayer,
          newGame: thisNewGame
        }));

        if (thisNewGame) thisNewGame = undefined;
      }
    });

    // Optional: handle window resize
    // window.addEventListener("resize", () => engine.resize());
  }

  play();
  return "";
}
