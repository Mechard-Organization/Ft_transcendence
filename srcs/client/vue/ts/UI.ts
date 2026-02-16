/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: abutet <abutet@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/07 16:17:53 by ajamshid          #+#    #+#             */
/*   Updated: 2026/02/16 09:28:18 by abutet           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Rectangle, ColorPicker, AdvancedDynamicTexture, Control, TextBlock, StackPanel } from "@babylonjs/gui/2D";
import { counter, scene, nullifySceneEngine, thisPlayer, setNewGame, resetCounter } from "../game/Meshes";
import { createRemotePlayPlayBtn, createRemoteBtn, createRemotePlayBtn, createCustomiseBtn, createStartBtn, createStartTournamentBtn, createMainMenuBtn, createSinglePlayerBtn, createMultiPlayerBtn, createTwoPlayerBtn, createTournamentBtn, createResumeBtn, createTextInput, createAddBtn, createWallsBtn, createBallBtn, createPaddlesBtn, createTableBtn, createCyberBtn, createNaturalBtn, colorType, createDefaultBtn } from "./Buttons";


interface NewGame {
  type: "newGame",
  playerCount: number,
  mode: number,
  gameId?: number,
  playername: string[]
}

export let contestants: string[] = [];
export let contestantNumber = 0;
export let finalGoal: number = 3;
export let playername = ["player1", "player2"];
export let pause = 0;
export let playerCount = 0;
export let player1: TextBlock | null = null;
export let player2: TextBlock | null = null;

export let mainUI: AdvancedDynamicTexture | null = null;
export let multiUI: AdvancedDynamicTexture | null = null;
export let customiseUI: AdvancedDynamicTexture | null = null;
export let resumeUI: AdvancedDynamicTexture | null = null;
export let counterUI: AdvancedDynamicTexture | null = null;
export let disposableUI: AdvancedDynamicTexture | null = null;
export let tournamentUI: AdvancedDynamicTexture | null = null;
export let remoteUI: AdvancedDynamicTexture | null = null;

let selectedMesh: any;



export function resetBabylonJs() {
  nullifySceneEngine();
  if (mainUI)
    mainUI.dispose();
  if (multiUI)
    multiUI.dispose();
  if (customiseUI)
    customiseUI.dispose();
  if (resumeUI)
    resumeUI.dispose();
  if (counterUI)
    counterUI.dispose();
  if (disposableUI)
    disposableUI.dispose();
  if (player1)
    player1.dispose();
  if (player2)
    player2.dispose();
  if (tournamentUI)
    tournamentUI.dispose();
  if (remoteUI)
    remoteUI.dispose();
  player2 = player1 = disposableUI = counterUI = resumeUI = customiseUI = multiUI = mainUI = tournamentUI = remoteUI = null;
}

export function resetGame(type?: number) {
  if (type === undefined) {
    contestants = [];
    contestantNumber = 0;
  }
  setPause(0);
  resetCounter();
  // playBtn = 0;
  playerCount = 0;
  playername[0] = "player1";
  playername[1] = "player2";
}

function createTextBlock(input: string): TextBlock {
  const text = new TextBlock("text", input);
  text.fontFamily = "impact";
  text.fontWeight = "bold";
  text.color = "rgba(166, 124, 82, 1)";
  text.fontSize = 24;
  text.top = "100px";
  text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  return text;
}

export function drawText() {
  if (!player1) {
    player1 = new TextBlock("infoText", "player1");
    player1.fontFamily = "impact";
    player1.fontWeight = "bold";
    player1.color = "rgba(166, 124, 82, 1)";
    player1.fontSize = 30;
    player1.top = "50px";
    player1.left = "50px";
    player1.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    player1.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  }

  if (!player2) {
    player2 = new TextBlock("infoText", "player1");
    player2.fontFamily = "impact";
    player2.fontWeight = "bold";
    player2.color = "rgba(166, 124, 82, 1)";
    player2.fontSize = 30;
    player2.top = "50px";
    player2.left = "-50px";
    player2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    player2.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  }
  player1.text = playername[0] + "  " + counter[0].toString();
  player2.text = counter[1].toString() + "  " + playername[1];

  counterUI.addControl(player1);
  counterUI.addControl(player2);
}

export function setPlayerCount(num: number) {
  playerCount = num;
}

export function disposeDUI() {
  disposableUI.dispose();
  disposableUI = null;
}
export function disposeTUI() {
  tournamentUI.dispose();
  tournamentUI = null;
}
export function setPlayerName(names: string[]) {
  playername = names;
}
export function setPause(num: number) {
  pause = num;
}
export function setSelectedMesh(name: string) {
  selectedMesh = null;
  console.log("set selected mesh called")
  switch (name) {
    case "ball":
      selectedMesh = scene.getMeshByName("ball");
      break;
    case "table":
      selectedMesh = scene.getMeshByName("table");
      break;
    case "paddles":
      selectedMesh = scene.getMeshByName("paddle1");
      break;
    case "walls":
      selectedMesh = scene.getMeshByName("wallRight");
      break;
  }
}

export function createUI() {
  counterUI = AdvancedDynamicTexture.CreateFullscreenUI("counterUI");
  {
    mainUI = AdvancedDynamicTexture.CreateFullscreenUI("mainUI");
    mainUI.background = "rgba(255, 255, 255, 0.5)";
    const mainPanel = new StackPanel();
    const text = createTextBlock("Please select a game mode!");
    mainPanel.width = "220px";
    mainPanel.isVertical = true;
    mainUI.addControl(text);
    mainUI.addControl(mainPanel);

    const singlePlayerBtn = createSinglePlayerBtn();
    const multiPlayerBtn = createMultiPlayerBtn();
    const remotePlayerBtn = createRemoteBtn();
    const customiseBtn = createCustomiseBtn();
    // singlePlayerBtn.metadata = { ui: mainUI };
    // multiPlayerBtn.metadata = { ui: mainUI };
    mainPanel.addControl(singlePlayerBtn);
    mainPanel.addControl(multiPlayerBtn);
    mainPanel.addControl(remotePlayerBtn);
    mainPanel.addControl(customiseBtn);

    // mainUI.isForeground = false;
  }
  {
    multiUI = AdvancedDynamicTexture.CreateFullscreenUI("multiUI");
    multiUI.background = "rgba(255, 255, 255, 0.5)";
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
    remoteUI = AdvancedDynamicTexture.CreateFullscreenUI("remoteUI");
    remoteUI.background = "rgba(255, 255, 255, 0.5)";
    const remotePanel = new StackPanel("remotePanel");
    const text = createTextBlock("Enter username to create or game ID to join");
    remotePanel.width = "220px";
    remotePanel.isVertical = true;

    remoteUI.addControl(text);
    remoteUI.addControl(remotePanel);

    const textInput = createTextInput("textInput");
    const mainMenuBtn = createMainMenuBtn();
    const createGameBtn = createRemotePlayBtn(textInput);
    const joinGameBtn = createRemotePlayPlayBtn(textInput);

    remotePanel.addControl(textInput);
    remotePanel.addControl(createGameBtn);
    remotePanel.addControl(joinGameBtn);
    remotePanel.addControl(mainMenuBtn);
    remoteUI.rootContainer.isVisible = false;
    remoteUI.isForeground = false;
  }
  {
    resumeUI = AdvancedDynamicTexture.CreateFullscreenUI("resumeUI");
    resumeUI.background = "rgba(255, 255, 255, 0.5)";
    const resumePanel = new StackPanel();
    const text = createTextBlock("Game is paused");
    resumePanel.width = "300px";
    resumePanel.isVertical = true;
    // resumePanel.background = "rgba(255, 255, 255, 0)";

    resumeUI.addControl(text);
    resumeUI.addControl(resumePanel);

    const mainMenuBtn = createMainMenuBtn();
    const resumetBtn = createResumeBtn();

    resumePanel.addControl(mainMenuBtn);
    resumePanel.addControl(resumetBtn);
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (playerCount > 0 && thisPlayer.gameId) {
        console.log(thisPlayer.gameId);
        resumeUI.rootContainer.isVisible = true;
        resumeUI.isForeground = true;
        thisPlayer.pause = 1;
        console.log("pause set to 1")
      }
    }
  });
}
export function createTournamentUI() {
  tournamentUI = AdvancedDynamicTexture.CreateFullscreenUI("tournamentUI");
  tournamentUI.background = "rgba(255, 255, 255, 0.5)";
  const tournamentPanel = new StackPanel();
  const aliasPanel = new StackPanel();
  const text = createTextBlock("Please add 4 to 8 player Aliases!");
  tournamentPanel.width = aliasPanel.width = "300px";
  tournamentPanel.isVertical = aliasPanel.isVertical = true;
  tournamentPanel.height = aliasPanel.height = "60%";
  aliasPanel.left = "-40px";
  aliasPanel.top = "-40px";

  const rect = new Rectangle();
  rect.width = "100%";
  rect.height = "100%";
  rect.cornerRadius = 10;
  rect.thickness = 3;
  rect.color = "yellow";
  rect.background = "#ffffffff";
  aliasPanel.addControl(rect);

  const content = new StackPanel();
  content.isVertical = true;
  content.width = 1;
  content.height = 1;
  content.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  content.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

  rect.addControl(content);


  tournamentPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
  tournamentPanel.verticalAlignment = aliasPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  aliasPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT

  tournamentUI.addControl(text);
  tournamentUI.addControl(tournamentPanel);
  tournamentUI.addControl(aliasPanel);

  const textInput = createTextInput("");
  const mainMenuBtn = createMainMenuBtn();
  const startTournamentBtn = createStartTournamentBtn();
  const addBtn = createAddBtn(textInput, content);

  tournamentPanel.addControl(textInput);
  tournamentPanel.addControl(addBtn);
  tournamentPanel.addControl(startTournamentBtn);
  tournamentPanel.addControl(mainMenuBtn);
}

export function createdisposableUI(type: number) {
  resumeUI.rootContainer.isVisible = false;
  resumeUI.isForeground = false;
  let text: TextBlock | undefined;
  disposableUI = AdvancedDynamicTexture.CreateFullscreenUI("statsUI");
  disposableUI.background = "rgba(255, 255, 255, 0.5)";
  const statsPanel = new StackPanel();
  console.log("contestantS ", contestants);
  console.log("counter ", counter);
  console.log("contestants length ", contestants.length)
  if (counter[0] == finalGoal) {
    text = createTextBlock(playername[0] + " Won the game!");
    if (contestants.length >= 2) {
      contestants.splice(contestantNumber + 1, 1);
      contestantNumber++;
    }
  }
  else if (counter[1] == finalGoal) {
    text = createTextBlock(playername[1] + " Won the game!");
    if (contestants.length >= 2) {
      contestants.splice(contestantNumber, 1);
      contestantNumber++;
    }
  }
  else if (counter[0] == -1 || counter[1] == -1)
    text = createTextBlock("The game ID you have entered is invalid")

  statsPanel.width = "300px";
  statsPanel.isVertical = true;
  if (text)
    disposableUI.addControl(text);

  if (contestantNumber > contestants.length - 1)
    contestantNumber = 0;
  if (contestantNumber < contestants.length - 1) {
    resetGame(1);
    setPause(1);
    playerCount = 2;
    playername[0] = contestants[contestantNumber];
    playername[1] = contestants[contestantNumber + 1];
    thisPlayer.pause = 1;
    let newGame: NewGame = {
      type: "newGame",
      playerCount: 2,
      mode: 0,
      playername: playername
    }
    setNewGame(newGame);
    thisPlayer.pause = 1;
    // setValues(movePaddlesAndBalls(thisPlayer, newGame));

    if (text == undefined) {
      text = createTextBlock(`${contestants[contestantNumber]} VS ${contestants[contestantNumber + 1]}`);
      disposableUI.addControl(text);
    }
    else {
      const newText = createTextBlock(`${contestants[contestantNumber]} VS ${contestants[contestantNumber + 1]}`)
      newText.top = "150px";
      disposableUI.addControl(newText);
    }
    disposableUI.addControl(statsPanel);
    const mainMenuBtn = createMainMenuBtn();
    statsPanel.addControl(mainMenuBtn);
    const startBtn = createStartBtn();
    statsPanel.addControl(startBtn);
    return;
  }
  // resetGame(scene);
  disposableUI.addControl(statsPanel);
  const mainMenuBtn = createMainMenuBtn();
  statsPanel.addControl(mainMenuBtn);
  // const startBtn = createStartBtn();
  // statsPanel.addControl(startBtn);
}

export function createCutomiseUI() {
  customiseUI = AdvancedDynamicTexture.CreateFullscreenUI("customiseUI");
  customiseUI.background = "rgba(255, 255, 255, 0.5)";
  const selectorPanel = new StackPanel();
  selectorPanel.width = "300px";
  selectorPanel.isVertical = true;
  selectorPanel.height = "95%";
  selectorPanel.background = "rgba(255, 255, 255, 0.7)"
  selectorPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT

  customiseUI.addControl(selectorPanel);

  let picker = new ColorPicker("picker")
  picker.left = "15%"
  picker.widthInPixels = 200
  picker.onValueChangedObservable.add(observerBodyColor)

  const mainMenuBtn = createMainMenuBtn();
  const wallBtn = createWallsBtn();
  const ballBtn = createBallBtn();
  const paddlesBtn = createPaddlesBtn();
  const tableBtn = createTableBtn();
  const defaultBtn = createDefaultBtn();
  const cyber = createCyberBtn();
  const natural = createNaturalBtn();

  // const startTournamentBtn = createSaveBtn();
  customiseUI.addControl(picker);

  // selectortPanel.addControl(startTournamentBtn);
  selectorPanel.addControl(cyber);
  selectorPanel.addControl(natural);
  selectorPanel.addControl(ballBtn);
  selectorPanel.addControl(wallBtn);
  selectorPanel.addControl(paddlesBtn);
  selectorPanel.addControl(tableBtn);
  selectorPanel.addControl(defaultBtn);
  selectorPanel.addControl(mainMenuBtn);
}

function observerBodyColor(value: any, state: any) {
  console.log("selected mesh changing color");
  if (selectedMesh) {
    console.log("selected mesh changing color");
    let dC = selectedMesh.material.diffuseColor;
    let eC = selectedMesh.material.emissiveColor;
    if (colorType == 0) {
      selectedMesh.material.emissiveColor = value.clone();
    }
    if (colorType == 1) {
      selectedMesh.material.diffuseColor = value.clone();
    }
  }
}

