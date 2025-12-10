/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Meshes.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/09 14:01:28 by ajamshid          #+#    #+#             */
/*   Updated: 2025/12/08 16:00:09 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PointerDragBehavior, Texture, Color4, ParticleSystem, KeyboardEventTypes, TrailMesh, Color3, FreeCamera, StandardMaterial, Engine, Scene, ArcRotateCamera, HemisphericLight, PointLight, MeshBuilder, Vector3 } from "@babylonjs/core";
import { canvas, balld, paddleWidth, paddleHeight, wallHeight, resetGame, movePaddles, moveBall, AIDirection } from "./gameLogic";
import { createUI, drawText } from "../ts/UI";

let engine: Engine | null = null;
export let scene: Scene | null = null;
export let dragPos1 = new Vector3(0, 0, 0);
export let isDragging1 = false;
export let dragPos2 = new Vector3(0, 0, 0);
export let isDragging2 = false;

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

function createMeshes(scene: any) {
  // Mats for Meshes

  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.emissiveColor = new Color3(0, 0.5, 0);
  tableMat.diffuseColor = new Color3(0, 0, 0);

  const paddleMat = new StandardMaterial("paddleMat", scene);
  paddleMat.emissiveColor = new Color3(0.1, 0.1, 0.1);
  paddleMat.diffuseColor = new Color3(0, 0, 0);

  const ballMat = new StandardMaterial("ballMat", scene);
  ballMat.emissiveColor = new Color3(0.5, 0, 0);
  ballMat.diffuseColor = new Color3(0, 0, 0);

  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.emissiveColor = new Color3(0.5, 0.5, 0.5);
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
  const ball = MeshBuilder.CreateSphere("ball", { diameter: (balld.radius * 2) }, scene);
  ball.position = new Vector3(0, balld.radius + 1, 0);
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
  // particleSystem.minEmitBox = new Vector3(0, 0, 0);
  // particleSystem.maxEmitBox = new Vector3(0, 0, 0);
  particleSystem.minSize = 1;
  particleSystem.maxSize = 15;
  particleSystem.emitRate = 1000;
  // particleSystem.color = new Color4(0, 0, 1, 1);
  // particleSystem.color2 = new Color4(1, 0, 0, 1);
  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
  // particleSystem.direction1 = new Vector3(0, 0, 0);
  // particleSystem.direction2 = new Vector3(0, 0, 0);
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
  light.intensity = 0;
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
});

drag1.onDragEndObservable.add(() => {
  isDragging1 = false;
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
  console.log("is dragging 21");
});




export function pong(): string {
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