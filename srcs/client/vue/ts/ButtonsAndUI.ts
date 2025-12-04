/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ButtonsAndUI.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mechard <mechard@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2025/12/04 13:57:47 by mechard          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { AdvancedDynamicTexture, Button, InputText, Control, TextBlock, StackPanel } from "@babylonjs/gui/2D";
import { counter, resetGame, scene, nullifySceneEngine } from "../game/gameLogicAndMeshes";
// Create the canvas



let contestants: string[] = [];
let contestantNumber = 0;
export let finalGoal: number = 1;

let playername = ["player1", "player2"];
export let pause = 0;
// export let playBtn = 0;
export let playerCount = 0;
let mainUI: AdvancedDynamicTexture | null = null;
let multiUI: AdvancedDynamicTexture | null = null;
let tournamentUI: AdvancedDynamicTexture | null = null;
let resumeUI: AdvancedDynamicTexture | null = null;
let counterUI: AdvancedDynamicTexture | null = null;
let disposableUI: AdvancedDynamicTexture | null = null;
let player1: TextBlock | null = null;
let player2: TextBlock | null = null;

export function resetBabylonJs() {
  nullifySceneEngine();
  if (mainUI)
    mainUI.dispose();
  if (multiUI)
    multiUI.dispose();
  if (tournamentUI)
    tournamentUI.dispose();
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
  player2 = player1 = disposableUI = counterUI = resumeUI = tournamentUI = multiUI = mainUI = null;
}

export function resetGame2(type?: number) {
  if (type === undefined) {
    contestants = [];
    contestantNumber = 0;
  }
  pause = 0;
  // playBtn = 0;
  playerCount = 0;
  playername[0] = "player1";
  playername[1] = "player2";
}



function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index 0 ≤ j ≤ i
    [array[i], array[j]] = [array[j], array[i]];   // swap elements
  }
  return array;
}

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

export function createUI() {
  counterUI = AdvancedDynamicTexture.CreateFullscreenUI("counterUI");
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
    resumeUI = AdvancedDynamicTexture.CreateFullscreenUI("resumeUI");
    resumeUI.background = "rgba(13, 0, 48, 0.5)";
    const resumePanel = new StackPanel();
    const text = createTextBlock("Game is paused");
    resumePanel.width = "300px";
    resumePanel.isVertical = true;
    resumePanel.background = "black";

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
      resumeUI.rootContainer.isVisible = true;
      resumeUI.isForeground = true;
      pause = 1;
    }
  });
}
function createTournamentUI() {
  tournamentUI = AdvancedDynamicTexture.CreateFullscreenUI("tournamentUI");
  tournamentUI.background = "rgba(13, 0, 48, 0.5)";
  const tournamentPanel = new StackPanel();
  const aliasPanel = new StackPanel();
  const text = createTextBlock("Please add 4 to 8 player Aliases!");
  tournamentPanel.width = aliasPanel.width = "300px";
  tournamentPanel.isVertical = aliasPanel.isVertical = true;
  tournamentPanel.height = aliasPanel.height = "70%";
  tournamentPanel.background = aliasPanel.background = "rgba(13, 0, 48, 0.7)"
  tournamentPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
  tournamentPanel.verticalAlignment = aliasPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  aliasPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT

  tournamentUI.addControl(text);
  tournamentUI.addControl(tournamentPanel);
  tournamentUI.addControl(aliasPanel);

  const textInput = createTextInput();
  const mainMenuBtn = createMainMenuBtn();
  const startTournamentBtn = createStartTournamentBtn();
  const addBtn = createAddBtn(textInput, aliasPanel);

  tournamentPanel.addControl(textInput);
  tournamentPanel.addControl(addBtn);
  tournamentPanel.addControl(startTournamentBtn);
  tournamentPanel.addControl(mainMenuBtn);
}
function createStartTournamentBtn(): Button {
  const startTournamentBtn = Button.CreateSimpleButton("startBtn", "Start Tournament");
  buttonStyler(startTournamentBtn);
  // startBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  startTournamentBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    createdisposableUI(0);
    if (tournamentUI) {
      tournamentUI.dispose();
      tournamentUI = null;
    }
    // startBtn.metadata.panel.dispose();
    // (resumetBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return startTournamentBtn;
}
function createStartBtn(): Button {
  const startBtn = Button.CreateSimpleButton("startBtn", "Start");
  buttonStyler(startBtn);
  startBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;

    // resetGame(scene);
    // playerCount = 2;
    // playBtn = 1;
    pause = 0;
    // playername = [contestants[contestantNumber], contestants[contestantNumber + 1]];
    drawText();

    if (disposableUI) {
      disposableUI.dispose();
      disposableUI = null;
    }
  });
  return startBtn;
}
export function createdisposableUI(type: number) {

  let text: TextBlock | undefined;
  disposableUI = AdvancedDynamicTexture.CreateFullscreenUI("statsUI");
  disposableUI.background = "rgba(13, 0, 48, 0.5)";
  const statsPanel = new StackPanel();
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
  statsPanel.width = "300px";
  statsPanel.isVertical = true;
  if (text)
    disposableUI.addControl(text);

  if (contestantNumber > contestants.length - 1)
    contestantNumber = 0;
  if (contestantNumber < contestants.length - 1) {
    resetGame(scene, 1);
    pause = 1;
    playerCount = 2;
    playername[0] = contestants[contestantNumber];
    playername[1] = contestants[contestantNumber + 1];
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
  resetGame(scene);
  disposableUI.addControl(statsPanel);
  const mainMenuBtn = createMainMenuBtn();
  statsPanel.addControl(mainMenuBtn);
  // const startBtn = createStartBtn();
  // statsPanel.addControl(startBtn);
}

/*************************************************************************************/
/*************************************************************************************/
/*************************************************************************************/
/*************************************************************************************/
/******************************   IN GAME FUNCTIONS         ******************/




export function drawText() {
  if (!player1) {
    player1 = new TextBlock("infoText", "player1");
    player1.fontFamily = "impact";
    player1.fontWeight = "bold";
    player1.color = "white";
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
    player2.color = "white";
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






// const trail = new TrailMesh("trail", ball, scene, 10, 10); 


/*************************************************************************************/
/*************************************************************************************/
/*************************************************************************************/
/*************************************************************************************/
/******************************   particle system and buttons **********************/






function buttonStyler(button: Button) {
  button.width = "200px";
  button.height = "70px";
  button.color = "white";
  button.fontFamily = "impact";
  button.fontWeight = "bold";
  button.paddingTop = "10px";
  button.paddingBottom = "10px";
  button.background = "rgb(20,20,50)";
  button.thickness = 0;
}

function createMainMenuBtn(): Button {
  const mainMenuBtn = Button.CreateSimpleButton("mainMenuBtn", "Main Menu");
  buttonStyler(mainMenuBtn);
  // mainMenuBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  mainMenuBtn.onPointerUpObservable.add(() => {
    resetGame(scene);
    if (disposableUI) {
      disposableUI.dispose();
      disposableUI = null;
    }
    if (tournamentUI) {
      tournamentUI.dispose();
      tournamentUI = null;
    }
    mainUI.rootContainer.isVisible = true;
    mainUI.isForeground = true;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;

    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    // (mainMenuBtn.metadata.ui as AdvancedDynamicTexture).dispose();
    // mainUI = null;
  });
  return (mainMenuBtn);
}

function createSinglePlayerBtn(): Button {
  const singlePlayerBtn = Button.CreateSimpleButton("singlePlayerBtn", "Single Player");
  buttonStyler(singlePlayerBtn);
  // singlePlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  singlePlayerBtn.onPointerUpObservable.add(() => {
    resetGame(scene);
    playername = ["Player", "Bot"];
    playerCount = 1;
    // playBtn = 1;
    drawText();
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;

    // (singlePlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
    // mainUI = null;
  });
  return (singlePlayerBtn);
}

function createMultiPlayerBtn(): Button {
  const multiPlayerBtn = Button.CreateSimpleButton("multiPlayerBtn", "MultiPlayer");
  buttonStyler(multiPlayerBtn);
  // multiPlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  multiPlayerBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = true;
    multiUI.isForeground = true;

    // multiPlayerBtn.metadata.panel.dispose();
    // (multiPlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return multiPlayerBtn;
}
function createTwoPlayerBtn(): Button {
  const twoPlayerBtn = Button.CreateSimpleButton("twoPlayerBtn", "Two Players");
  buttonStyler(twoPlayerBtn);
  // twoPlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  twoPlayerBtn.onPointerUpObservable.add(() => {
    resetGame(scene);
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;

    playerCount = 2;
    // playBtn = 1;
    playername = ["Player1", "Player2"];
    drawText();
    // twoPlayerBtn.metadata.panel.dispose();
    // (twoPlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return twoPlayerBtn;
}
function createTournamentBtn(): Button {
  const tournamentBtn = Button.CreateSimpleButton("tournamentBtn", "Tournament");
  buttonStyler(tournamentBtn);
  // tournamentBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  tournamentBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    createTournamentUI();
    // tournamentBtn.metadata.panel.dispose();
    // (tournamentBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return tournamentBtn;
}
function createResumeBtn(): Button {
  const resumetBtn = Button.CreateSimpleButton("resumetBtn", "Resume");
  buttonStyler(resumetBtn);
  // resumetBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  resumetBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;

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
  buttonStyler(addBtn);
  // addBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  addBtn.onPointerUpObservable.add(() => {
    if (input.text === "" || (contestants.indexOf(input.text) + 1))
      input.background = "red";
    else {
      const text = new TextBlock("text", input.text);
      text.height = "30px";
      input.background = "rgba(81, 81, 138, 1)";
      text.fontFamily = "impact";
      text.color = "white";
      text.size = "20px";
      text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      aliasPanel.addControl(text);
      contestants.push(input.text);
      shuffle(contestants);
      input.text = "";
    }
    // addBtn.metadata.panel.dispose();
    // (addBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return addBtn;
}

