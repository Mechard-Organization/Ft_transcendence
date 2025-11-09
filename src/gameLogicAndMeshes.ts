/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLogicAndMeshes.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/09 14:01:28 by ajamshid          #+#    #+#             */
/*   Updated: 2025/11/09 14:01:29 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Texture, Color4, ParticleSystem, KeyboardEventTypes, TrailMesh, Color3, FreeCamera, StandardMaterial, Engine, Scene, ArcRotateCamera, HemisphericLight, PointLight, MeshBuilder, Vector3 } from "@babylonjs/core";
import { playerCount, finalGoal, drawText, createUI, pause, resetGame2, createdisposableUI } from "./ButtonsAndUI";

const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 6;
const wallHeight = 20;
const balld = { radius: 10, dx: cosDeg(45) * (Math.random() > 0.5 ? 1 : -1), dz: sinDeg(45) * (Math.random() > 0.5 ? 1 : -1), currentSpeed: 3, beginSpeed: 3, speedAfterHit: 6 };
let engine: Engine | null = null;
export let scene: Scene | null = null;
export let counter = [0, 0];

export function resetGame(scene: any, type?: number) {
  if (scene) {
    const paddle1 = scene.getMeshByName("paddle1");
    const paddle2 = scene.getMeshByName("paddle2");
    const ball = scene.getMeshByName("ball");
    paddle2.position.x = -(canvas.width / 2) + 20;
    paddle1.position.x = (canvas.width / 2) - 20;
    ball.position.x = 0;
    ball.position.z = 0;
  }
  balld.dx = cosDeg(45) * (Math.random() > 0.5 ? 1 : -1);
  balld.dz = sinDeg(45) * (Math.random() > 0.5 ? 1 : -1);
  balld.currentSpeed = balld.beginSpeed;
  counter[0] = 0;
  counter[1] = 0;
  resetGame2(type);
}
export function nullifySceneEngine() {
  if (engine) {
    engine.dispose?.();
    engine = null;
  }
  if (scene) {
    scene.dispose?.();
    scene = null;
  }
}


const keys: { [key: string]: boolean } = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
const canvas = document.createElement("canvas");
canvas.id = "gameCanvas";
canvas.width = 800;
canvas.height = 600;
canvas.style.background = "black";
canvas.style.display = "block";
canvas.style.margin = "0 auto";

let Direction = 0;
//AI next position finder
function AIDirection(ball: any) {
  let difference = 0;
  let x = ball.position.x + (balld.dx * balld.currentSpeed * 58);
  if (!(x < canvas.width / 2 -25 && x > -canvas.width / 2 + 25)) {
    if (x > 0)
      x = x - (canvas.width / 2 + 25);
    else x = x + (canvas.width / 2 - 25);
    difference = Math.abs(x / (balld.dx * balld.currentSpeed));
  }
  let i = ball.position.z + (balld.dz * balld.currentSpeed * (58 - difference))+ 40 * (Math.random() > 0.5 ? 1 : -1);;
  while ((-canvas.height / 2) > i || (canvas.height / 2) < i) {
    if ((-canvas.height / 2) > i)
      i = (((i + canvas.height / 2) * -1) - (canvas.height / 2))
    else
      i = (((i - canvas.height / 2) * -1) + (canvas.height / 2))
  }
  Direction = i;
  // Direction.setPos((((canvas.height / 2 + ball.position.z) + (balld.dz * (engine.getFps() + 20))) % canvas.height) - (canvas.height / 2));
  // Direction.setPos1((((canvas.height / 2 + ball.position.z) + (balld.dz * 60)) % canvas.height) - (canvas.height / 2));
}




function movePaddles(scene: any) {
  const paddle1 = scene.getMeshByName("paddle1");
  const paddle2 = scene.getMeshByName("paddle2");
  if (playerCount > 0) {
    if (keys["w"] && paddle1.position.z > -canvas.height / 2 + 50) paddle1.position.z -= paddleSpeed;
    if (keys["s"] && paddle1.position.z < canvas.height / 2 - 50) paddle1.position.z += paddleSpeed;
  }
  else {
    if ((Direction < paddle1.position.z) && paddle1.position.z > -canvas.height / 2 + 50 && balld.dx > 0) paddle1.position.z -= paddleSpeed;
    if ((Direction > paddle1.position.z) && paddle1.position.z < canvas.height / 2 - 50 && balld.dx > 0) paddle1.position.z += paddleSpeed;
  }
  if (playerCount > 1) {
    if (keys["ArrowUp"] && paddle2.position.z > -canvas.height / 2 + 50) paddle2.position.z -= paddleSpeed;
    if (keys["ArrowDown"] && paddle2.position.z < canvas.height / 2 - 50) paddle2.position.z += paddleSpeed;
  }
  else {
    if ((Direction < paddle2.position.z) && paddle2.position.z > -canvas.height / 2 + 50 && balld.dx < 0) paddle2.position.z -= paddleSpeed;
    if ((Direction > paddle2.position.z) && paddle2.position.z < canvas.height / 2 - 50 && balld.dx < 0) paddle2.position.z += paddleSpeed;
  }
}

function sinDeg(degrees: number) {
  return Math.sin(degrees * Math.PI / 180);
}
function cosDeg(degrees: number) {
  return Math.cos(degrees * Math.PI / 180);
}

function moveBall(scene: any): number {
  const paddle1 = scene.getMeshByName("paddle1");
  const paddle2 = scene.getMeshByName("paddle2");
  const ball = scene.getMeshByName("ball");
  const wallLeft = scene.getMeshByName("wallLeft");
  const wallRight = scene.getMeshByName("wallRight");

  //move ball
  ball.position.x += balld.dx * balld.currentSpeed;
  ball.position.z += balld.dz * balld.currentSpeed;
  ball.refreshBoundingInfo();

  //top/bottom bounce
  if ((ball.position.z + balld.radius >= canvas.height / 2 && balld.dz > 0) || (ball.position.z - balld.radius <= -canvas.height / 2 && balld.dz < 0)) {
    balld.dz *= -1;
    ball.refreshBoundingInfo();
  }

  //paddle1 bounce
  if (ball.position.x + balld.radius >= paddle1.position.x - 5 &&
    ball.position.z < (paddle1.position.z + (paddleHeight / 2)) && ball.position.z > (paddle1.position.z - (paddleHeight / 2))) {
    let angle = (canvas.height / 2 + ball.position.z) - (canvas.height / 2 + paddle1.position.z);
    let direction = (angle >= 0) ? 1 : -1;
    if (balld.dx > 0 && ball.position.x + balld.radius > paddle1.position.x) {
      balld.dz = sinDeg(Math.abs(Math.trunc(angle)) * 1.5) * direction;
      balld.dx = cosDeg(Math.abs(Math.trunc(angle)) * 1.5) * -1;
    }
    balld.currentSpeed = balld.speedAfterHit;
    ball.refreshBoundingInfo();
  }

  //paddle2 bounce
  if (ball.position.x - balld.radius <= paddle2.position.x + 5 &&
    ball.position.z < (paddle2.position.z + (paddleHeight / 2)) && ball.position.z > (paddle2.position.z - (paddleHeight / 2))) {
    let angle = (canvas.height / 2 + ball.position.z) - (canvas.height / 2 + paddle2.position.z);
    let direction = (angle >= 0) ? 1 : -1;
    if (balld.dx < 0 && ball.position.x - balld.radius < paddle2.position.x) {
      balld.dz = sinDeg(Math.abs(Math.trunc(angle))) * direction;
      balld.dx = cosDeg(Math.abs(Math.trunc(angle)));
    }
    balld.currentSpeed = balld.speedAfterHit;
    ball.refreshBoundingInfo();
  }

  //wall colusion
  if (ball.position.x + balld.radius >= wallLeft.position.x || ball.position.x - balld.radius <= wallRight.position.x) {
    if (ball.position.x + balld.radius >= wallLeft.position.x)
      counter[1]++;
    else
      counter[0]++;
    if (counter[0] === finalGoal && playerCount > 0)
      createdisposableUI(0);
    if (counter[1] === finalGoal && playerCount > 0)
      createdisposableUI(0);
    drawText();
    ball.position = new Vector3(0, balld.radius + 1, 0);
    ball.refreshBoundingInfo();
    balld.dx = cosDeg(45) * (Math.random() > 0.5 ? 1 : -1);
    balld.dz = sinDeg(45) * (Math.random() > 0.5 ? 1 : -1);
    balld.currentSpeed = balld.beginSpeed;
  }
  return 2;
}

function createMeshes(scene: any) {
  const table = MeshBuilder.CreateGround("table", { width: canvas.width, height: canvas.height }, scene);
  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.diffuseColor = new Color3(0, 0.3, 0);
  table.material = tableMat;
  // Paddles

  const paddle1 = MeshBuilder.CreateBox("paddle1", { width: paddleWidth, height: 40, depth: paddleHeight }, scene);
  paddle1.position = new Vector3(canvas.width / 2 - 20, 20, 0);
  paddle1.refreshBoundingInfo();
  // paddle1.showBoundingBox = true;  

  const paddle2 = paddle1.clone("paddle2");
  paddle2.position.x = -(canvas.width / 2) + 20;
  paddle2.refreshBoundingInfo();
  // paddle2.showBoundingBox = true;  
  // Ball

  const ball = MeshBuilder.CreateSphere("ball", { diameter: (balld.radius * 2) }, scene);
  ball.position = new Vector3(0, balld.radius + 1, 0);
  ball.refreshBoundingInfo();
  const ballMat = new StandardMaterial("ballMat", scene);
  ballMat.emissiveColor = new Color3(0.5, 0, 0);
  ball.material = ballMat;
  // ball.showBoundingBox = true;

  const wallLeft = MeshBuilder.CreateBox("wallLeft", { width: 10, height: wallHeight, depth: canvas.height }, scene);
  wallLeft.position = new Vector3(canvas.width / 2 + 5, wallHeight / 2, 0);
  wallLeft.refreshBoundingInfo();

  const wallRight = MeshBuilder.CreateBox("wallRight", { width: 10, height: wallHeight, depth: canvas.height }, scene);
  wallRight.position = new Vector3(-canvas.width / 2 - 5, wallHeight / 2, 0);
  wallRight.refreshBoundingInfo();

  const middleLine = MeshBuilder.CreateBox("middleLine", { width: 10, height: 0, depth: canvas.height }, scene);
  middleLine.position = new Vector3(0, 0, 0);
  middleLine.refreshBoundingInfo();

  const wallTop = MeshBuilder.CreateBox("wallTop", { width: canvas.width + 20, height: wallHeight, depth: 10 }, scene);
  wallTop.position = new Vector3(0, wallHeight / 2, -canvas.height / 2 - 5);
  wallTop.refreshBoundingInfo();

  const wallBottom = MeshBuilder.CreateBox("wallBottop", { width: canvas.width + 20, height: wallHeight, depth: 10 }, scene);
  wallBottom.position = new Vector3(0, wallHeight / 2, canvas.height / 2 + 5);
  wallBottom.refreshBoundingInfo();

  const particleSystem = new ParticleSystem("trail", 2000, scene);
  particleSystem.particleTexture = new Texture("textures/flare.png", scene);
  particleSystem.emitter = ball;
  particleSystem.minEmitBox = new Vector3(0, 0, 0);
  particleSystem.maxEmitBox = new Vector3(0, 0, 0);
  particleSystem.color1 = new Color4(1, 0, 0, 1);
  particleSystem.color2 = new Color4(1, 0, 0, 1);
  particleSystem.minSize = 1;
  particleSystem.maxSize = 15;
  particleSystem.emitRate = 500;
  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
  particleSystem.direction1 = new Vector3(0, 0, 0);
  particleSystem.direction2 = new Vector3(0, 0, 0);
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.3;
  particleSystem.start();
}
function createScene(engine: any) {
  const scene = new Scene(engine);
  // Camera
  const camera = new FreeCamera("camera", new Vector3(0, canvas.width, canvas.height), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  // Light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 1;
  return scene;
};

export function gamePage(): string {
  const app = document.getElementById("app")!;
  resetGame(null);
  function play() {
    if (!app.contains(canvas))
      app.appendChild(canvas);
    engine = new Engine(canvas, true);
    scene = createScene(engine);
    createMeshes(scene);
    resetGame(scene);
    createUI();
    drawText();
    let lastTime = 0;
    scene.onBeforeRenderObservable.add(() => {
      scene.onBeforeRenderObservable.add(() => {
        const now = performance.now();
        if (now - lastTime >= 1000) {
          lastTime = now;
          AIDirection(scene.getMeshByName("ball"));
        }
      });
      movePaddles(scene);
      moveBall(scene);
    });
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
  play();
  return "";
}