/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   play.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2025/11/02 19:09:06 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Color3, FreeCamera, StandardMaterial, Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, InputText, Control, TextBlock, StackPanel } from "@babylonjs/gui/2D";

// Create the canvas

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

const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 5;
const wallHeight = 20;
const balld = { radius: 10, dx: (Math.random() > 0.5 ? 1 : -1), dz: (Math.random() > 0.5 ? 1 : -1), currentSpeed: 3, beginSpeed: 3, speedAfterHit: 6 };
let score = { a: 0, b: 0 };
let contestents: string[] = [];
let loosers: string[] = [];
let finalGoal: number = 10;
let id: number = 0;
let engine: Engine | null = null;
let scene: Scene | null = null;
let counter = [0, 0];
let pause = 0;
let playBtn = 0;
let playerCount = 0;
let mainUI: AdvancedDynamicTexture | null = null;
let multiUI: AdvancedDynamicTexture | null = null;
let tournamentUI: AdvancedDynamicTexture | null = null;
let resumeUI: AdvancedDynamicTexture | null = null;

export function resetBabylonJs() {
  if (engine) {
    engine.dispose();
    engine = null;
  }
  if (scene) {
    scene.dispose();
    scene = null;
  }
  if (mainUI) {
    mainUI.dispose();
    mainUI = null;
  }
  if (multiUI) {
    multiUI.dispose();
    multiUI = null;
  }
  if (tournamentUI) {
    tournamentUI.dispose();
    tournamentUI = null;
  }
    if (resumeUI) {
    resumeUI.dispose();
    resumeUI = null;
  }
}

function resetGame(scene: any) {
  if (scene) {
    const paddle1 = scene.getMeshByName("paddle1");
    const paddle2 = scene.getMeshByName("paddle2");
    const ball = scene.getMeshByName("ball");
    paddle2.position.x = -(canvas.width / 2) + 20;
    paddle1.position.x = (canvas.width / 2) - 20;
    ball.position.x = 0;
    ball.position.z = 0;
  }
  pause = 0;
  playBtn = 0;
  score.a = 0;
  score.b = 0;
  contestents = [];
  loosers = [];
  playerCount = 0;
  counter[0] = 0;
  counter[1] = 0;
}



function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index 0 ≤ j ≤ i
    [array[i], array[j]] = [array[j], array[i]];   // swap elements
  }
  return array;
}

function createMainMenuBtn(): Button {
  const mainMenuBtn = Button.CreateSimpleButton("mainMenuBtn", "Main Menu");
  mainMenuBtn.width = "200px";
  mainMenuBtn.height = "70px";
  mainMenuBtn.color = "white";
  mainMenuBtn.fontFamily = "impact";
  mainMenuBtn.fontWeight = "bold";
  // mainMenuBtn.margin = "1px";
  mainMenuBtn.paddingTop = "10px";
  mainMenuBtn.paddingBottom = "10px";
  mainMenuBtn.background = "rgb(20,20,50)";
  mainMenuBtn.thickness = 0;
  // mainMenuBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  mainMenuBtn.onPointerUpObservable.add(() => {
    resetGame(scene);
    playerCount = 1;
    playBtn = 1;
    mainUI.rootContainer.isVisible = true;
    mainUI.isForeground = true;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    tournamentUI.rootContainer.isVisible = false;
    tournamentUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    // (mainMenuBtn.metadata.ui as AdvancedDynamicTexture).dispose();
    // mainUI = null;
  });
  return (mainMenuBtn);
}

function createSinglePlayerBtn(): Button {
  const singlePlayerBtn = Button.CreateSimpleButton("singlePlayerBtn", "Single Player");
  singlePlayerBtn.width = "200px";
  singlePlayerBtn.height = "70px";
  singlePlayerBtn.color = "white";
  singlePlayerBtn.fontFamily = "impact";
  singlePlayerBtn.fontWeight = "bold";
  singlePlayerBtn.paddingTop = "10px";
  singlePlayerBtn.paddingBottom = "10px";
  singlePlayerBtn.thickness = 0;
  // singlePlayerBtn.margin = "1px";
  singlePlayerBtn.background = "rgb(20,20,50)";
  // singlePlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  singlePlayerBtn.onPointerUpObservable.add(() => {
    resetGame(scene);
    playerCount = 1;
    playBtn = 1;
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    tournamentUI.rootContainer.isVisible = false;
    tournamentUI.isForeground = false;
    // (singlePlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
    // mainUI = null;
  });
  return (singlePlayerBtn);
}

function createMultiPlayerBtn(): Button {
  const multiPlayerBtn = Button.CreateSimpleButton("multiPlayerBtn", "MultiPlayer");
  multiPlayerBtn.width = "200px";
  multiPlayerBtn.height = "70px";
  multiPlayerBtn.color = "white";
  multiPlayerBtn.fontFamily = "impact";
  multiPlayerBtn.fontWeight = "bold";
  multiPlayerBtn.paddingTop = "10px";
  multiPlayerBtn.paddingBottom = "10px";
  multiPlayerBtn.thickness = 0;
  // multiPlayerBtn.marginTop = "100px";
  multiPlayerBtn.background = "rgb(20,20,50)";
  // multiPlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  multiPlayerBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = true;
    multiUI.isForeground = true;
    tournamentUI.rootContainer.isVisible = false;
    tournamentUI.isForeground = false;
    // multiPlayerBtn.metadata.panel.dispose();
    // (multiPlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return multiPlayerBtn;
}
function createTwoPlayerBtn(): Button {
  const twoPlayerBtn = Button.CreateSimpleButton("twoPlayerBtn", "Two Players");
  twoPlayerBtn.width = "200px";
  twoPlayerBtn.height = "70px";
  twoPlayerBtn.color = "white";
  twoPlayerBtn.fontFamily = "impact";
  twoPlayerBtn.fontWeight = "bold";
  twoPlayerBtn.paddingTop = "10px";
  twoPlayerBtn.paddingBottom = "10px";
  twoPlayerBtn.thickness = 0;
  // twoPlayerBtn.marginTop = "100px";
  twoPlayerBtn.background = "rgb(20,20,50)";
  // twoPlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  twoPlayerBtn.onPointerUpObservable.add(() => {
    resetGame(scene);
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    tournamentUI.rootContainer.isVisible = false;
    tournamentUI.isForeground = false;
    playerCount = 2;
    playBtn = 1;
    // twoPlayerBtn.metadata.panel.dispose();
    // (twoPlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return twoPlayerBtn;
}
function createTournamentBtn(): Button {
  const tournamentBtn = Button.CreateSimpleButton("tournamentBtn", "Tournament");
  tournamentBtn.width = "200px";
  tournamentBtn.height = "70px";
  tournamentBtn.color = "white";
  tournamentBtn.fontFamily = "impact";
  tournamentBtn.fontWeight = "bold";
  tournamentBtn.paddingTop = "10px";
  tournamentBtn.paddingBottom = "10px";
  tournamentBtn.thickness = 0;
  // tournamentBtn.marginTop = "100px";
  tournamentBtn.background = "rgb(20,20,50)";
  // tournamentBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  tournamentBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    tournamentUI.rootContainer.isVisible = true;
    tournamentUI.isForeground = true;
    // tournamentBtn.metadata.panel.dispose();
    // (tournamentBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return tournamentBtn;
}
function createResumeBtn(): Button {
  const resumetBtn = Button.CreateSimpleButton("resumetBtn", "Resume");
  resumetBtn.width = "200px";
  resumetBtn.height = "70px";
  resumetBtn.color = "white";
  resumetBtn.fontFamily = "impact";
  resumetBtn.fontWeight = "bold";
  resumetBtn.paddingTop = "10px";
  resumetBtn.paddingBottom = "10px";
  resumetBtn.thickness = 0;
  // resumetBtn.marginTop = "100px";
  resumetBtn.background = "rgb(20,20,50)";
  // resumetBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  resumetBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    tournamentUI.rootContainer.isVisible = false;
    tournamentUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    pause = 0;
    // resumetBtn.metadata.panel.dispose();
    // (resumetBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return resumetBtn;
}
function createTextInput(): InputText {
  var input = new InputText();
  input.width = "200px";
  input.maxWidth = "200px";
  input.height = "70px";
  input.color = "white";
  input.background = "rgba(81, 81, 138, 1)";
  input.promptMessage = "Enter your name...";
  input.paddingTop = "10px";
  input.paddingBottom = "10px";
  input.thickness = 0;
  return input;
}


function createAddBtn(input: InputText, aliasPanel: StackPanel): Button {
  const addBtn = Button.CreateSimpleButton("addBtn", "Add");
  addBtn.width = "200px";
  addBtn.height = "70px";
  addBtn.color = "white";
  addBtn.fontFamily = "impact";
  addBtn.fontWeight = "bold";
  addBtn.paddingTop = "10px";
  addBtn.paddingBottom = "10px";
  addBtn.thickness = 0;
  // addBtn.marginTop = "100px";
  addBtn.background = "rgb(20,20,50)";
  // addBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  addBtn.onPointerUpObservable.add(() => {
    if (input.text === "")
      input.background = "red";
    else {
      const text = new TextBlock("text", input.text);
      text.height = "30px";
      text.fontFamily = "impact";
      text.color = "white";
      text.size = "20px";
      text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      text.textHorizontalAlignment = Control.VERTICAL_ALIGNMENT_LEFT;
      aliasPanel.addControl(text);
      contestents.push(input.text);
      input.text = "";
    }
    // addBtn.metadata.panel.dispose();
    // (addBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return addBtn;
}


//   function add(){
//     if(input.value === "")
//       input.style.backgroundColor = "red";
//     else {
//       const p = document.createElement("p");
//       p.textContent = `${input.value}`;
//       app.appendChild(p);
//       input.style.backgroundColor = "white";
//       contestents.push(input.value);
//       input.value = "";
//     }
//   }

function createTextBlock(input: string): TextBlock {
  const text = new TextBlock("text", input);
  text.fontFamily = "impact";
  text.fontWeight = "bold";
  text.color = "white";
  text.fontSize = 24;
  text.top = "100px";
  text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  return text;
}

function CreateUI(position: number) {
  {
    mainUI = AdvancedDynamicTexture.CreateFullscreenUI("mainUI");
    mainUI.background = "rgba(13, 0, 48, 0.5)";
    const mainPanel = new StackPanel();
    const text = createTextBlock("Please select a game mode!");
    mainPanel.width = "220px";
    mainPanel.isVertical = true;
    mainUI.addControl(text);
    mainUI.addControl(mainPanel);


    const singlePlayerBtn = createSinglePlayerBtn();
    const multiPlayerBtn = createMultiPlayerBtn();
    const mainMenuBtn = createMainMenuBtn();
    // singlePlayerBtn.metadata = { ui: mainUI };
    // multiPlayerBtn.metadata = { ui: mainUI };
    mainPanel.addControl(singlePlayerBtn);
    mainPanel.addControl(multiPlayerBtn);
    mainPanel.addControl(mainMenuBtn);

    // mainUI.isForeground = false;
  }
  {
    multiUI = AdvancedDynamicTexture.CreateFullscreenUI("multiUI");
    multiUI.background = "rgba(13, 0, 48, 0.5)";
    const multiPlayerPanel = new StackPanel();
    const text = createTextBlock("Please select a game mode!");
    multiPlayerPanel.width = "220px";
    multiPlayerPanel.isVertical = true;
    // multiPlayerPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    // multiPlayerPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    multiUI.addControl(text);
    multiUI.addControl(multiPlayerPanel);

    const twoPlayerBtn = createTwoPlayerBtn();
    const tournamentBtn = createTournamentBtn();
    const mainMenuBtn = createMainMenuBtn();
    // singlePlayerBtn.metadata = { ui: multiUI };
    // twoPlayerBtn.metadata = { ui: multiUI };
    multiPlayerPanel.addControl(twoPlayerBtn);
    multiPlayerPanel.addControl(tournamentBtn);
    multiPlayerPanel.addControl(mainMenuBtn);

    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
  }
  {
    tournamentUI = AdvancedDynamicTexture.CreateFullscreenUI("tournamentUI");
    tournamentUI.background = "rgba(13, 0, 48, 0.5)";
    const tournamentPanel = new StackPanel();
    const aliasPanel = new StackPanel();
    const text = createTextBlock("Please add 4 to 8 player Aliases!");
    tournamentPanel.width = "300px";
    tournamentPanel.isVertical = true;
    tournamentPanel.background = "black";
    // tournamentPanel.padding = "50px";
    tournamentPanel.height = "80%";
    tournamentPanel.background = "rgba(13, 0, 48, 0.7)"
    tournamentPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    // tournamentPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_LEFT;
    aliasPanel.width = "300px";
    aliasPanel.isVertical = true;
    aliasPanel.background = "black";
    aliasPanel.background = "black";
    // tournamentPanel.paddingRight = "90px";
    aliasPanel.height = "80%";
    aliasPanel.background = "rgba(13, 0, 48, 0.7)"
    aliasPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    // tournamentPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    tournamentUI.addControl(text);
    tournamentUI.addControl(tournamentPanel);
    tournamentUI.addControl(aliasPanel);

    const textInput = createTextInput();
    const mainMenuBtn = createMainMenuBtn();
    const addBtn = createAddBtn(textInput, aliasPanel);
    // singlePlayerBtn.metadata = { ui: tournamentUI };
    // twoPlayerBtn.metadata = { ui: tournamentUI };
    tournamentPanel.addControl(textInput);
    tournamentPanel.addControl(addBtn);
    tournamentPanel.addControl(mainMenuBtn);
    tournamentUI.rootContainer.isVisible = false;
    tournamentUI.isForeground = false;
  }
  {
    resumeUI = AdvancedDynamicTexture.CreateFullscreenUI("resumeUI");
        resumeUI.background = "rgba(13, 0, 48, 0.5)";
    const resumePanel = new StackPanel();
    const aliasPanel = new StackPanel();
    const text = createTextBlock("Game is paused");
    resumePanel.width = "300px";
    resumePanel.isVertical = true;
    resumePanel.background = "black";

    resumeUI.addControl(text);
    resumeUI.addControl(resumePanel);

    const mainMenuBtn = createMainMenuBtn();
    const resumetBtn = createResumeBtn();
    // singlePlayerBtn.metadata = { ui: resumeUI };
    // twoPlayerBtn.metadata = { ui: resumeUI };
    resumePanel.addControl(mainMenuBtn);
    resumePanel.addControl(resumetBtn);
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      resumeUI.rootContainer.isVisible = true;
      resumeUI.isForeground = true;
      pause = 1;
    }
  });
}


function movePaddles(scene: any) {
  const paddle1 = scene.getMeshByName("paddle1");
  const paddle2 = scene.getMeshByName("paddle2");
  const ball = scene.getMeshByName("ball");
  if (playerCount > 0) {
    if (keys["w"] && paddle1.position.z > -canvas.height / 2 + 50) paddle1.position.z -= paddleSpeed;
    if (keys["s"] && paddle1.position.z < canvas.height / 2 - 50) paddle1.position.z += paddleSpeed;
  }
  else {
    if (ball.position.z < paddle1.position.z) paddle1.position.z -= paddleSpeed;
    if (ball.position.z > paddle1.position.z) paddle1.position.z += paddleSpeed;
  }

  if (playerCount > 1) {
    if (keys["ArrowUp"] && paddle2.position.z > -canvas.height / 2 + 50) paddle2.position.z -= paddleSpeed;
    if (keys["ArrowDown"] && paddle2.position.z < canvas.height / 2 - 50) paddle2.position.z += paddleSpeed;
  }
  else {
    if (ball.position.z < paddle2.position.z) paddle2.position.z -= paddleSpeed;
    if (ball.position.z > paddle2.position.z) paddle2.position.z += paddleSpeed;
  }
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
  if (ball.position.z + balld.radius >= canvas.height / 2 || ball.position.z - balld.radius <= -canvas.height / 2) {
    balld.dz *= -1;
    ball.refreshBoundingInfo();
  }
  //paddle1 bounce
  if (ball.position.x + balld.radius >= paddle1.position.x - 5 &&
    ball.position.z < (paddle1.position.z + (paddleHeight / 2)) && ball.position.z > (paddle1.position.z - (paddleHeight / 2))) {
    if (balld.dx * balld.currentSpeed <= paddle1.position.x + 5)
      balld.dx *= -1;
    balld.dz = ((canvas.height / 2 + ball.position.z) - (canvas.height / 2 + paddle1.position.z)) * 0.04;
    // if(ball.position.z < paddle1.position.z)
    //   balld.dz = (Math.abs(ball.position.z) - Math.abs(paddle1.position.z)) * -0.02;
    // else
    //    balld.dz = (Math.abs(ball.position.z) - Math.abs(paddle1.position.z)) * 0.02;
    balld.currentSpeed = balld.speedAfterHit;
    ball.refreshBoundingInfo();
  }
  //paddle2 bounce
  if (ball.position.x - balld.radius <= paddle2.position.x + 5 &&
    ball.position.z < (paddle2.position.z + (paddleHeight / 2)) && ball.position.z > (paddle2.position.z - (paddleHeight / 2))) {
    if (balld.dx * balld.currentSpeed >= paddle2.position.x + 5)
      balld.dx *= -1;
    balld.dz = ((canvas.height / 2 + ball.position.z) - (canvas.height / 2 + paddle2.position.z)) * 0.04;
    // if(ball.position.z < paddle2.position.z)
    //   balld.dz = (Math.abs(ball.position.z) - Math.abs(paddle2.position.z)) * -0.02;
    // else
    //    balld.dz = (Math.abs(ball.position.z) - Math.abs(paddle2.position.z)) * 0.02;
    balld.currentSpeed = balld.speedAfterHit;
    ball.refreshBoundingInfo();
  }
  //wall colusion
  if (ball.position.x + balld.radius >= wallLeft.position.x || ball.position.x - balld.radius <= wallRight.position.x) {
    if (ball.position.x + balld.radius >= wallLeft.position.x)
      counter[1]++;
    else
      counter[0]++;
    if (counter[0] === finalGoal)
      return (1);
    if (counter[1] === finalGoal)
      return (0);
    ball.position = new Vector3(0, balld.radius + 1, 0);
    ball.refreshBoundingInfo();
    balld.dx = (Math.random() > 0.5 ? 1 : -1);
    balld.dz = (Math.random() > 0.5 ? 1 : -1);
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

//Play page function
export function gamePage(): string {


  const app = document.getElementById("app")!;
  resetGame(null);
  // app.innerHTML = "";

  // const input = document.createElement("input");
  // input.type = "text";
  // input.placeholder = "enter participant alias";

  // const addBtn = document.createElement("button");
  // addBtn.textContent = "Add participant";
  // addBtn.style.margin = "10px"

  // const finalizeBtn = document.createElement("button");
  // finalizeBtn.textContent = "finalize";
  // finalizeBtn.style.margin = "10px"

  // // buttons
  const singlePlayerBtn = document.createElement("button");
  singlePlayerBtn.textContent = "Single Player";
  singlePlayerBtn.style.margin = "10px"

  // const multiPlayerBtn = document.createElement("button");
  // multiPlayerBtn.textContent = "Multi Player";
  // multiPlayerBtn.style.margin = "10px"

  // const twoPlayerBtn = document.createElement("button");
  // twoPlayerBtn.textContent = "Two players";
  // twoPlayerBtn.style.margin = "10px"

  // const tournamentBtn = document.createElement("button");
  // tournamentBtn.textContent = "Tournament";
  // tournamentBtn.style.margin = "10px"

  // const mainMenuBtn = document.createElement("button");
  // mainMenuBtn.textContent = "Main menu";
  // mainMenuBtn.style.margin = "10px"

  // canvas

  // Get the root element where canvas will be appended



  // function drawText(textGiven: number | string, player: number, playerName?: string) {
  //   const text = new TextBlock("infoText", "Hello, Babylon!");
  //   text.color = "white";
  //   text.fontSize = 24;
  //   text.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
  //   text.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;

  // // Add it to the UI
  // ui.addControl(text);

  //     let fontSize = 20;
  //   ctx.font = `${fontSize}px arial`;
  //   ctx.fillStyle = 'white';
  //   if(playerName !== undefined){
  //     const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
  //     const yPos = 20;
  //     ctx.fillText(playerName, xPos, yPos);
  //   }

  //   fontSize = 50;
  //   ctx.font = `${fontSize}px arial`;
  //   const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
  //   const yPos = fontSize + 30;
  //   if (typeof (text) == 'number')
  //     ctx.fillText(text.toString(), xPos, yPos);
  //   else
  //     ctx.fillText(text, xPos, yPos);
  // }


  function play() {
    if (!app.contains(canvas))
      app.appendChild(canvas);
    engine = new Engine(canvas, true);
    scene = createScene(engine);
    createMeshes(scene);
    resetGame(scene);

    //   const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // //   ui.background = "rgba(0,0,0,0.5)";
    //     // const button1 = Button.CreateSimpleButton("button", "click");
    //   const button = Button.CreateSimpleButton("btn", "Click Me");
    //   button.width = "200px";
    //   button.height = "50px";
    //   button.color = "white";
    //   button.border = "none";
    //   button.padding = "0";
    //   button.background = "rgb(20,20,50";
    //   button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

    //   button.onPointerUpObservable.add(() => {
    //     ui.dispose();
    //     // engine.stopRenderLoop();
    //   });
    //   const button1 = Button.CreateSimpleButton("btn", "Click Me");
    //   button1.width = "150px";
    //   button1.height = "50px";
    //   button1.color = "white";
    //   button1.background = "green";
    //   button1.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    //   button1.onPointerUpObservable.add(

    //     // engine.runRenderLoop(() => {
    //     // scene.render();})
    //     );

    //     const text = new TextBlock("infoText", "Hello, Babylon!");
    // text.color = "white";
    // text.fontSize = 24;
    // text.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    // text.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;

    // // Add it to the UI
    // ui.addControl(text);
    //   ui.addControl(button1);
    //   ui.addControl(button);


    CreateUI(0);
    let lastTime = 0;
    scene.onBeforeRenderObservable.add(() => {
      if (pause != 1) {
        scene.onBeforeRenderObservable.add(() => {
          const now = performance.now();
          if (now - lastTime >= 1000) {
            lastTime = now;
          }
        });
        if (!playBtn) {
          movePaddles(scene);
          moveBall(scene);
        }
        else {
          movePaddles(scene);
          moveBall(scene);
        }
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    // window.addEventListener("resize", () => {
    //   engine.resize();
    // });
  }

  // const cylinder = MeshBuilder.CreateCylinder("cylinder", {height: 6, diameterTop: 3, diameterBottom: 3}, scene);
  // cylinder.position = new Vector3(-40.5, 1, 43.5);
  // cylinder.rotation.x += 1.1;
  // cylinder.rotation.z += 7.3;


  /*-----------------------------------------------------------------*/
  // app.appendChild(canvas);

  // // Create Babylon.js engine
  // const engine = new Engine(canvas, true);

  // // Create a scene
  // const scene = new Scene(engine);

  // // Create an ArcRotateCamera and attach controls
  // const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 5, Vector3.Zero(), scene);
  // camera.attachControl(canvas, true);

  // // Add hemispheric light
  // const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // // Create a box
  // const ground = MeshBuilder.CreateGround("ground", {width: 4, height: 4, subdivisions: 25}, scene);
  // const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);

  // ground.rotation.y += 0.8;
  // // Rotate the box continuously
  // scene.onBeforeRenderObservable.add(() => {
  //   box.rotation.y += 0.01;
  // });

  // // Start the render loop
  // engine.runRenderLoop(() => {
  //   scene.render();
  // });

  // // Handle window resizing
  // window.addEventListener("resize", () => {
  //   engine.resize();
  // });
  /*-----------------------------------------------------------------*/


  // const ctx = canvas.getContext("2d")!;

  // //game settings
  // const paddleWidth = 10, paddleHeight = 100;
  // const player = { x: 20, y: canvas.height / 2 - 50, speed: 7 };
  // const ai = { x: canvas.width - 30, y: canvas.height / 2 - 50, speed: 4 };
  // const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: (Math.random() > 0.5 ? 1 : -1), dy: (Math.random() > 0.5 ? 1 : -1), speed: 3 };
  // let score = { a: 0, b: 0 };

  // // Keyboard controls
  // const keys: { [key: string]: boolean } = {};
  // document.addEventListener("keydown", e => keys[e.key] = true);
  // document.addEventListener("keyup", e => keys[e.key] = false);


  // // Game logic
  // function movePaddles(playerCount: number) {
  //   if (keys["w"] && player.y > 0) player.y -= player.speed;
  //   if (keys["s"] && player.y + paddleHeight < canvas.height) player.y += player.speed;
  //   if (playerCount > 0) {
  //     if (keys["ArrowUp"] && ai.y > 0) ai.y -= ai.speed;
  //     if (keys["ArrowDown"] && ai.y + paddleHeight < canvas.height) ai.y += ai.speed;
  //   }
  //   else {
  //     if (ball.y < ai.y + paddleHeight / 2) ai.y -= ai.speed;
  //     if (ball.y > ai.y + paddleHeight / 2) ai.y += ai.speed;

  //   }
  // }

  // function moveBall(): number {
  //   ball.x += ball.dx * ball.speed;
  //   ball.y += ball.dy * ball.speed;

  //   // Top/bottom bounce
  //   if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
  //     ball.dy *= -1;
  //   }

  //   // Paddle collisions
  //   if (ball.x - ball.radius <= player.x + paddleWidth &&
  //     ball.y > player.y && ball.y < player.y + paddleHeight) {
  //     ball.dx *= -1;
  //     let paddleMiddle = player.y + paddleHeight - 50;
  //     ball.dy = (ball.y - paddleMiddle) * 0.02;
  //     ball.speed = 7;
  //   }

  //   if (ball.x + ball.radius > ai.x &&
  //     ball.y > ai.y && ball.y < ai.y + paddleHeight) {
  //     ball.dx *= -1;
  //     let paddleMiddle = ai.y + paddleHeight - 50;
  //     ball.dy = (ball.y - paddleMiddle) * 0.06;
  //     ball.speed = 7;
  //   }

  //   // Reset if ball goes out
  //   if (ball.x <= player.x - 1 || ball.x >= ai.x) {
  //     if (ball.x <= player.x)
  //       counter[1]++;
  //     else
  //       counter[0]++;
  //     if (counter[0] === finalGoal)
  //       return (1);
  //     if(counter[1] === finalGoal)
  //       return (0);
  //     ball.x = canvas.width / 2;
  //     ball.y = canvas.height / 2;
  //     ball.dx = (Math.random() > 0.5 ? 1 : -1);
  //     ball.dy = (Math.random() > 0.5 ? 1 : -1);
  //     ball.speed = 3;
  //   }
  //   return 2;
  // }

  //   function drawRect(x: number, y: number, w: number, h: number, color: string) {
  //   ctx.fillStyle = color;
  //   ctx.fillRect(x, y, w, h);
  // }

  // function drawCircle(x: number, y: number, r: number, color: string) {
  //   ctx.fillStyle = color;
  //   ctx.beginPath();
  //   ctx.arc(x, y, r, 0, Math.PI * 2);
  //   ctx.closePath();
  //   ctx.fill();
  // }

  // function drawNet() {
  //   for (let i = 0; i < canvas.height; i += 20) {
  //     drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
  //   }
  // }

  // function drawText(text: number | string, player: number, playerName?: string) {
  //   let fontSize = 20;
  //   ctx.font = `${fontSize}px arial`;
  //   ctx.fillStyle = 'white';
  //   if(playerName !== undefined){
  //     const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
  //     const yPos = 20;
  //     ctx.fillText(playerName, xPos, yPos);
  //   }

  //   fontSize = 50;
  //   ctx.font = `${fontSize}px arial`;
  //   const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
  //   const yPos = fontSize + 30;
  //   if (typeof (text) == 'number')
  //     ctx.fillText(text.toString(), xPos, yPos);
  //   else
  //     ctx.fillText(text, xPos, yPos);
  // }

  // function draw(player1?: string, player2?:string) {
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   drawNet();
  //   drawRect(player.x, player.y, paddleWidth, paddleHeight, "white");
  //   drawRect(ai.x, ai.y, paddleWidth, paddleHeight, "white");
  //   drawCircle(ball.x, ball.y, ball.radius, "white");
  //   if (counter[0] === finalGoal || counter[1] === finalGoal) {
  //     cancelAnimationFrame(id);
  //     if (counter[0] == finalGoal)
  //       drawText("WIN", 0, player1);
  //     else
  //       drawText("WIN", 1, player2);
  //     counter[0] = 0;
  //     counter[1] = 0;
  //   }
  //   else {
  //     drawText(counter[0], 0, player1);
  //     drawText(counter[1], 1, player2);
  //   }
  // }

  // // Game loop
  // function gameLoop(playerCount: number, player1?: string, player2?:string, resolve?: (winnerIndex: number) => void) {
  //   movePaddles(playerCount);
  //   let status = moveBall();
  //   draw(player1, player2);
  //   if (status === 2)
  //     id = requestAnimationFrame(() => gameLoop(playerCount, player1, player2, resolve));
  //   else if (resolve) 
  //     resolve(status); 
  // }
  // //clear canvas
  // function clearCanvas() {
  //   cancelAnimationFrame(id);
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   counter[0] = 0;
  //   counter[1] = 0;
  //   player.x = 20; player.y= canvas.height / 2 - 50; player.speed= 7;
  //   ai.x = canvas.width - 30; ai.y= canvas.height / 2 - 50; ai.speed= 4;
  //   ball.x = canvas.width / 2; ball.y= canvas.height / 2; ball.radius= 10; ball.dx= (Math.random() > 0.5 ? 1 : -1); ball.dy= (Math.random() > 0.5 ? 1 : -1); ball.speed= 3;
  //   input.value = "";
  //   app.innerHTML = "";
  //   ball.speed = 3;
  // }
  // // main menue botton funtion
  // function mainMenu() {
  //   clearCanvas();
  //   app.appendChild(singlePlayerBtn);
  //   app.appendChild(multiPlayerBtn);
  //   app.appendChild(mainMenuBtn);
  // }

  // // Start the game loop


  // function gameTypeSelector() {
  //   clearCanvas();
  //   app.appendChild(tournamentBtn);
  //   app.appendChild(twoPlayerBtn);
  //   app.appendChild(mainMenuBtn);
  // }

  // function play(playerCount: number, player1?:string, player2?:string):Promise<number> {
  //   return new Promise((resolve) => {
  //   cancelAnimationFrame(id);
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   player.x = 20; player.y= canvas.height / 2 - 50; player.speed= 7;
  //   ai.x = canvas.width - 30; ai.y= canvas.height / 2 - 50; ai.speed= 4;
  //   ball.x = canvas.width / 2; ball.y= canvas.height / 2; ball.radius= 10; ball.dx= (Math.random() > 0.5 ? 1 : -1); ball.dy= (Math.random() > 0.5 ? 1 : -1); ball.speed= 3;
  //   counter[0] = 0;
  //   counter[1] = 0;
  //   ball.speed = 3;
  //   if (!app.contains(canvas))
  //     app.appendChild(canvas);
  //   gameLoop(playerCount, player1, player2, resolve);
  //   });
  // }

  // function waitForStart(): Promise<void> {
  //   return new Promise<void>((resolve) => {
  //     const startBtn = document.createElement("button");
  //       startBtn.textContent = "START";
  //       startBtn.style.margin = "10px"
  //       app.appendChild(startBtn);
  //       startBtn.addEventListener('click', () => {
  //       resolve();
  //     }, { once: true });
  //   });
  // }
  // function waitForContinue(): Promise<void> {
  //   return new Promise<void>((resolve) => {
  //     const startBtn = document.createElement("button");
  //       startBtn.textContent = "CONTINUE";
  //       startBtn.style.margin = "10px"
  //       app.appendChild(startBtn);
  //       startBtn.addEventListener('click', () => {
  //       resolve();
  //     }, { once: true });
  //   });
  // }


  //   function Tournament(){
  //     clearCanvas();
  //     app.appendChild(mainMenuBtn);
  //     app.appendChild(input);
  //     app.appendChild(addBtn);
  //     app.appendChild(finalizeBtn);
  //     // app.innerHTML += `<div id="contestent box" style="text-align=left"></div> `;
  //   }

  //   function add(){
  //     if(input.value === "")
  //       input.style.backgroundColor = "red";
  //     else {
  //       const p = document.createElement("p");
  //       p.textContent = `${input.value}`;
  //       app.appendChild(p);
  //       input.style.backgroundColor = "white";
  //       contestents.push(input.value);
  //       input.value = "";
  //     }
  //   }

  //   async function finalize(){
  //     if (contestents.length > 1){
  //       contestents = shuffle(contestents);

  //       while(contestents.length != 1){
  //         for(let i = 0; i < (contestents.length -1); i++){
  //           clearCanvas();
  //           app.appendChild(tournamentBtn);
  //           app.appendChild(twoPlayerBtn);
  //           app.appendChild(mainMenuBtn);
  //           const p = document.createElement("p");
  //           p.textContent = `${contestents[i]} VS ${contestents[i+1]}`;
  //           app.appendChild(p);
  //           await waitForStart();
  //           const looser = await play(1, contestents[i], contestents[i+1]);
  //           contestents.splice(i+looser, 1);
  //           await waitForContinue();
  //         }
  //       }
  //     }
  //   }
  // app.appendChild(singlePlayerBtn);
  //   // Attach button actions
  //   singlePlayerBtn.addEventListener("click", () => play(0));
  //   multiPlayerBtn.addEventListener("click", gameTypeSelector);
  //   twoPlayerBtn.addEventListener("click", () => play(1));
  //   tournamentBtn.addEventListener("click", Tournament);
  //   addBtn.addEventListener("click", add);
  //   finalizeBtn.addEventListener("click", finalize);
  //   mainMenuBtn.addEventListener("click", mainMenu);



  //   mainMenu();
  // Return empty string because canvas is appended dynamically
  play();
  return "";
}