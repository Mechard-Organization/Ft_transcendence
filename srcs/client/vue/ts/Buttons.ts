/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Buttons.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2025/12/25 17:41:36 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Button, InputText, Control, TextBlock, StackPanel } from "@babylonjs/gui/2D";
import { Color3 } from "@babylonjs/core";
import { thisPlayer, scene, username, setNewGame } from "../game/Meshes";
import { setSelectedMesh, createCutomiseUI, createdisposableUI, createTournamentUI, mainUI, multiUI, tournamentUI, resumeUI, disposableUI, contestants, drawText, disposeDUI, disposeTUI, setPlayerCount, setPlayerName, setPause, customiseUI, resetGame } from "./UI"

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index 0 ≤ j ≤ i
    [array[i], array[j]] = [array[j], array[i]];   // swap elements
  }
  return array;
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


export let colorType = defaultSettings.colorType;

interface NewGame {
  type: "newGame",
  playerCount: number,
  mode: number,
  playerIds?: number[],
  playername: string[]
}
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

export function createMainMenuBtn(): Button {
  const mainMenuBtn = Button.CreateSimpleButton("mainMenuBtn", "Main Menu");
  buttonStyler(mainMenuBtn);
  // mainMenuBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  mainMenuBtn.onPointerUpObservable.add(() => {
    resetGame();
    let newGame: NewGame = {
      type: "newGame",
      playerCount: 0,
      mode: 0,
      playername: ["Bot", "Bot"]
    }
    thisPlayer.pause = 0;
    setNewGame(newGame);
    // setValues(movePaddlesAndBalls({type:"wsMessage", player:thisPlayer, newGame:newGame}));
    if (disposableUI) {
      disposeDUI();
    }
    if (tournamentUI) {
      disposeTUI();
    }
    mainUI.rootContainer.isVisible = true;
    mainUI.isForeground = true;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    if (customiseUI) {
      customiseUI.rootContainer.isVisible = false;
      customiseUI.isForeground = false;
    }
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    // (mainMenuBtn.metadata.ui as AdvancedDynamicTexture).dispose();
    // mainUI = null;
  });
  return (mainMenuBtn);
}

export function createSinglePlayerBtn(): Button {
  const singlePlayerBtn = Button.CreateSimpleButton("singlePlayerBtn", "Single Player");
  buttonStyler(singlePlayerBtn);
  // singlePlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  singlePlayerBtn.onPointerUpObservable.add(() => {
    resetGame();
    // setPlayerName([username, "Bot"]);
    setPlayerCount(1);
    let newGame: NewGame = {
      type: "newGame",
      playerCount: 1,
      mode: 0,
      playername: [username, "Bot"]
    }
    setNewGame(newGame);
    // setValues(movePaddlesAndBalls({type:"wsMessage", player:thisPlayer, newGame:newGame}));
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

export function createMultiPlayerBtn(): Button {
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
export function createTwoPlayerBtn(): Button {
  const twoPlayerBtn = Button.CreateSimpleButton("twoPlayerBtn", "Two Players");
  buttonStyler(twoPlayerBtn);
  // twoPlayerBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  twoPlayerBtn.onPointerUpObservable.add(() => {
    resetGame();
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;

    setPlayerCount(2);
    setPlayerName(["Player1", "Player2"]);
    let newGame: NewGame = {
      type: "newGame",
      playerCount: 2,
      mode: 0,
      playername: [username, "Player2"]
    }
    setNewGame(newGame);
    // setValues(movePaddlesAndBalls({type:"wsMessage", player:thisPlayer, newGame:newGame}));
    drawText();
    // twoPlayerBtn.metadata.panel.dispose();
    // (twoPlayerBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return twoPlayerBtn;
}

export function createTournamentBtn(): Button {
  const tournamentBtn = Button.CreateSimpleButton("tournamentBtn", "Tournament");
  buttonStyler(tournamentBtn);
  // tournamentBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  tournamentBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resetGame();
    createTournamentUI();
    // tournamentBtn.metadata.panel.dispose();
    // (tournamentBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return tournamentBtn;
}
export function createResumeBtn(): Button {
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
    setPause(0);
    thisPlayer.pause = 0;
    // resumetBtn.metadata.panel.dispose();
    // (resumetBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return resumetBtn;
}
export function createTextInput(): InputText {
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


export function createAddBtn(input: InputText, aliasPanel: StackPanel): Button {
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

export function createStartTournamentBtn(): Button {
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
      disposeTUI();
    }
    // startBtn.metadata.panel.dispose();
    // (resumetBtn.metadata.ui as AdvancedDynamicTexture).dispose();
  });
  return startTournamentBtn;
}
export function createStartBtn(): Button {
  const startBtn = Button.CreateSimpleButton("startBtn", "Start");
  buttonStyler(startBtn);
  startBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;

    // resetGame();
    // playerCount = 2;
    // playBtn = 1;
    setPause(0);
    thisPlayer.pause = 0;
    // let newGame: NewGame = {
    //   type: "newGame",
    //   playerCount: playerCount,
    //   mode: 0,
    //   playername: playername
    // }
    // setNewGame(newGame);
    // setValues(movePaddlesAndBalls({type:"wsMessage", player:thisPlayer, newGame:newGame}));
    // playername = [contestants[contestantNumber], contestants[contestantNumber + 1]];
    drawText();

    if (disposableUI) {
      disposeDUI();
    }
  });
  return startBtn;
}

export function createCustomiseBtn(): Button {
  const customiseBtn = Button.CreateSimpleButton("customiseBtn", "Customise");
  buttonStyler(customiseBtn);
  customiseBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    createCutomiseUI();
  });
  return customiseBtn;
}
export function createBallBtn(): Button {
  const ballBtn = Button.CreateSimpleButton("ballBtn", "Ball");
  buttonStyler(ballBtn);
  ballBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("ball");
  });
  return ballBtn;
}
export function createTableBtn(): Button {
  const tableBtn = Button.CreateSimpleButton("tableBtn", "Table");
  buttonStyler(tableBtn);
  tableBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("table");
  });
  return tableBtn;
}
export function createPaddlesBtn(): Button {
  const paddlesBtn = Button.CreateSimpleButton("paddlesBtn", "paddles");
  buttonStyler(paddlesBtn);
  paddlesBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("paddles");
  });
  return paddlesBtn;
}
export function createWallsBtn(): Button {
  const wallsBtn = Button.CreateSimpleButton("wallsBtn", "walls");
  buttonStyler(wallsBtn);
  wallsBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("walls");
  });
  return wallsBtn;
}
export function createCyberBtn(): Button {
  const cyberBtn = Button.CreateSimpleButton("cyberBtn", "cyber view");
  buttonStyler(cyberBtn);
  cyberBtn.onPointerUpObservable.add(() => {
    let c = scene.getMaterialByName("ballMat");
    if (colorType == 1) {
      c.emissiveColor = c.diffuseColor.clone();
      c.diffuseColor = new Color3(0, 0, 0);

      c = scene.getMaterialByName("tableMat");
      c.emissiveColor = c.diffuseColor.clone();
      c.diffuseColor = new Color3(0, 0, 0);

      c = scene.getMaterialByName("paddleMat");
      c.emissiveColor = c.diffuseColor.clone();
      c.diffuseColor = new Color3(0, 0, 0);

      c = scene.getMaterialByName("wallMat");
      c.emissiveColor = c.diffuseColor.clone();
      c.diffuseColor = new Color3(0, 0, 0);
      let light = scene.getLightByName("light");
      if (!light)
        console.log("there is not light")
      light.intensity = 0;
      colorType = 0;
    }
  });
  return cyberBtn;
}
export function createNaturalBtn(): Button {
  const naturalBtn = Button.CreateSimpleButton("naturalBtn", "natural view");
  buttonStyler(naturalBtn);
  naturalBtn.onPointerUpObservable.add(() => {
    let c = scene.getMaterialByName("ballMat");
    if (colorType == 0) {
      c.diffuseColor = c.emissiveColor.clone();
      c.emissiveColor = new Color3(0, 0, 0);

      c = scene.getMaterialByName("tableMat");
      c.diffuseColor = c.emissiveColor.clone();
      c.emissiveColor = new Color3(0, 0, 0);

      c = scene.getMaterialByName("paddleMat");
      c.diffuseColor = c.emissiveColor.clone();
      c.emissiveColor = new Color3(0, 0, 0);

      c = scene.getMaterialByName("wallMat");
      c.diffuseColor = c.emissiveColor.clone();
      c.emissiveColor = new Color3(0, 0, 0);

      let light = scene.getLightByName("light");
      if (!light)
        console.log("there is not light")
      light.intensity = 1;
      colorType = 1;
    }
  });
  return naturalBtn;
}

export function createDefaultBtn(): Button {
  const defaultBtn = Button.CreateSimpleButton("defaultBtn", "default settings");
  buttonStyler(defaultBtn);
  defaultBtn.onPointerUpObservable.add(() => {
    let c = scene.getMaterialByName("ballMat");
    c.emissiveColor = defaultSettings.ballMat.clone();
    c.diffuseColor = new Color3(0, 0, 0);

    c = scene.getMaterialByName("tableMat");
    c.emissiveColor = defaultSettings.tableMat.clone();
    c.diffuseColor = new Color3(0, 0, 0);

    c = scene.getMaterialByName("paddleMat");
    c.emissiveColor = defaultSettings.paddleMat.clone();
    c.diffuseColor = new Color3(0, 0, 0);

    c = scene.getMaterialByName("wallMat");
    c.emissiveColor = defaultSettings.wallMat.clone();
    c.diffuseColor = new Color3(0, 0, 0);
    let light = scene.getLightByName("light");
    if (!light)
      console.log("there is not light")
    light.intensity = defaultSettings.lightIntensity;
    colorType = defaultSettings.colorType;
  });
  return defaultBtn;
}