/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Buttons.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: abutet <abutet@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2026/02/19 11:40:49 by abutet           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Button, InputText, Control, TextBlock, StackPanel } from "@babylonjs/gui/2D";
import { Color3 } from "@babylonjs/core";
import { thisPlayer, scene, username, setNewGame, resetCounter} from "../game/Meshes";
import { setSelectedMesh, createCutomiseUI, createdisposableUI, createTournamentUI, mainUI, multiUI, tournamentUI, resumeUI, disposableUI, contestants, drawText, disposeDUI, disposeTUI, setPlayerCount, setPlayerName, setPause, customiseUI, resetGame, remoteUI } from "./UI"

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
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
  tableMat: new Color3(1, 0.95, 0.45),
  paddleMat: new Color3(0.1, 0.1, 0.1),
  ballMat: new Color3(0.6, 0.5, 0.33),
  wallMat: new Color3(0.6, 0.5, 0.33),
  lightIntensity: 0,
  colorType: 0,
};

export let colorType = defaultSettings.colorType;

interface NewGame {
  type: "newGame",
  playerCount: number,
  mode: number,
  gameId?: number,
  playername: string[]
}
function buttonStyler(button: Button, str: string) {
  const text = new TextBlock();
  text.text = str;
  text.color = "rgba(166, 124, 82, 1)";
  text.fontFamily = "impact";
  text.fontWeight = "bold"
  button.addControl(text);
  button.cornerRadius = 10;
  button.thickness = 4;
  button.color = "rgba(254, 233, 110, 1)";
  button.width = "200px";
  button.height = "70px";
  button.paddingTop = "7px";
  button.paddingBottom = "7px";
  button.background = "rgba(255, 255, 255, 1)";
}

export function createMainMenuBtn(): Button {
  const mainMenuBtn = Button.CreateSimpleButton("mainMenuBtn");
  buttonStyler(mainMenuBtn, "Main Menu");
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
    remoteUI.rootContainer.isVisible = false;
    remoteUI.isForeground = false;

    const input = remoteUI.getControlByName("remotePanel")?.children.find(c => c.name === "textInput");
    if (input) input.text = '';
    if(input) input.background = "rgba(255, 255, 255, 1)";
  });
  return (mainMenuBtn);
}

export function createSinglePlayerBtn(): Button {
  const singlePlayerBtn = Button.CreateSimpleButton("singlePlayerBtn");
  buttonStyler(singlePlayerBtn, "Single Player");
  singlePlayerBtn.onPointerUpObservable.add(() => {
    resetGame();
    setPlayerCount(1);
    let newGame: NewGame = {
      type: "newGame",
      playerCount: 1,
      mode: 0,
      playername: [username, "Bot"]
    }
    setNewGame(newGame);
    drawText();
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
  });
  return (singlePlayerBtn);
}

export function createMultiPlayerBtn(): Button {
  const multiPlayerBtn = Button.CreateSimpleButton("multiPlayerBtn");
  buttonStyler(multiPlayerBtn, "MultiPlayer");
  multiPlayerBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = true;
    multiUI.isForeground = true;
  });
  return multiPlayerBtn;
}
export function createTwoPlayerBtn(): Button {
  const twoPlayerBtn = Button.CreateSimpleButton("twoPlayerBtn");
  buttonStyler(twoPlayerBtn, "Two Players");
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
    drawText();
  });
  return twoPlayerBtn;
}

export function createTournamentBtn(): Button {
  const tournamentBtn = Button.CreateSimpleButton("tournamentBtn");
  buttonStyler(tournamentBtn, "Tournament");
  tournamentBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resetGame();
    createTournamentUI();
  });
  return tournamentBtn;
}
export function createResumeBtn(): Button {
  const resumetBtn = Button.CreateSimpleButton("resumetBtn");
  buttonStyler(resumetBtn, "Resume");
  resumetBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;

    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    setPause(0);
    thisPlayer.pause = 0;
  });
  return resumetBtn;
}

export function createTextInput(name: string): InputText {
  var input = new InputText(name);

  input.width = "200px";
  input.maxWidth = "200px";
  input.height = "70px";
  input.thickness = 3;
  input.background = "rgba(255, 255, 255, 1)";
  input.color = "rgba(166, 124, 82, 1)";

  input.focusedBackground = "rgba(255, 255, 255, 1)";
  input.focusedColor = "rgba(166, 124, 82, 1)";
  input.promptMessage = "contestant name";
  input.paddingTop = "10px";
  input.paddingBottom = "10px";

  return input;
}


export function createAddBtn(input: InputText, aliasPanel: StackPanel): Button {
  const addBtn = Button.CreateSimpleButton("addBtn");
  buttonStyler(addBtn, "Add");
  addBtn.onPointerUpObservable.add(() => {
    if (input.text === "" || (contestants.indexOf(input.text) + 1))
      input.background = "rgba(255, 110, 110, 1)";
    else if (contestants.length < 8) {
      const text = new TextBlock("text", input.text);
      text.height = "40px";
      text.top = "20px";
      text.left = "30px";
      input.background = "rgba(255, 255, 255, 1)";
      text.fontFamily = "impact";
      text.color = "rgba(166, 124, 82, 1)";
      text.fontSize = "25px";
      // text.fontWeight = "";
      text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      aliasPanel.addControl(text);
      contestants.push(input.text);
      shuffle(contestants);
      input.text = "";
    }
  });
  return addBtn;
}

export function createStartTournamentBtn(): Button {
  const startTournamentBtn = Button.CreateSimpleButton("startBtn");
  buttonStyler(startTournamentBtn, "Start Tournament");
  startTournamentBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    resetCounter();
    createdisposableUI(0);
    if (tournamentUI) {
      disposeTUI();
    }
  });
  return startTournamentBtn;
}

export function createStartBtn(): Button {
  const startBtn = Button.CreateSimpleButton("startBtn");
  buttonStyler(startBtn, "Start");
  startBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;

    setPause(0);
    thisPlayer.pause = 0;
    drawText();
    if (disposableUI) {
      disposeDUI();
    }
  });
  return startBtn;
}

export function createCustomiseBtn(): Button {
  const customiseBtn = Button.CreateSimpleButton("customiseBtn");
  buttonStyler(customiseBtn, "Customise");
  customiseBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    createCutomiseUI();
  });
  return customiseBtn;
}
export function createBallBtn(): Button {
  const ballBtn = Button.CreateSimpleButton("ballBtn");
  buttonStyler(ballBtn, "Ball");
  ballBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("ball");
  });
  return ballBtn;
}
export function createTableBtn(): Button {
  const tableBtn = Button.CreateSimpleButton("tableBtn");
  buttonStyler(tableBtn, "Table");
  tableBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("table");
  });
  return tableBtn;
}
export function createPaddlesBtn(): Button {
  const paddlesBtn = Button.CreateSimpleButton("paddlesBtn");
  buttonStyler(paddlesBtn, "paddles");
  paddlesBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("paddles");
  });
  return paddlesBtn;
}
export function createWallsBtn(): Button {
  const wallsBtn = Button.CreateSimpleButton("wallsBtn");
  buttonStyler(wallsBtn, "walls");
  wallsBtn.onPointerUpObservable.add(() => {
    setSelectedMesh("walls");
  });
  return wallsBtn;
}

export function createRemoteBtn(): Button {
  const startBtn = Button.CreateSimpleButton("remotePlayer");
  buttonStyler(startBtn, "Remote Player");
  startBtn.onPointerUpObservable.add(() => {
    mainUI.rootContainer.isVisible = false;
    mainUI.isForeground = false;
    multiUI.rootContainer.isVisible = false;
    multiUI.isForeground = false;
    resumeUI.rootContainer.isVisible = false;
    resumeUI.isForeground = false;
    remoteUI.rootContainer.isVisible = true;
    remoteUI.isForeground = true;

    if (disposableUI) {
      disposeDUI();
    }
  });
  return startBtn;
}

export function createRemotePlayBtn(input: InputText): Button {
  const addBtn = Button.CreateSimpleButton("createGameBtn");
  buttonStyler(addBtn, "Create New Game");
  // addBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  addBtn.onPointerUpObservable.add(() => {
    if (input.text === "")
      input.background = "rgba(255, 110, 110, 1)";
    else {
      (async () => {
        try {
          const user = await fetch("/api/getuserbyname", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          const userData = await user.json();

          const adv = await fetch("/api/getuserbyname", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: input.text }),
          });
          const advData = await adv.json();
          if (!userData || !user.ok || !advData || !adv.ok)
            input.background = "rgba(255, 110, 110, 1)";
          else
          {
            mainUI.rootContainer.isVisible = false;
            mainUI.isForeground = false;
            multiUI.rootContainer.isVisible = false;
            multiUI.isForeground = false;
            resumeUI.rootContainer.isVisible = false;
            resumeUI.isForeground = false;
            remoteUI.rootContainer.isVisible = false;
            remoteUI.isForeground = false;

            setPlayerCount(2);
            setPlayerName(["Player1", "Player2"]);
            let newGame: NewGame = {
              type: "newGame",
              playerCount: 2,
              mode: 1,
              playername: [username, input.text]
            }
            setNewGame(newGame);
            console.log("new game created ", newGame.gameId)

            if (disposableUI) {
              disposeDUI();
            }
          }
        } catch (err) {
          console.error("Erreur:", err);
        }
      })();
    }
  });
  return addBtn;
}

export function createRemotePlayPlayBtn(input: InputText): Button {
  const addBtn = Button.CreateSimpleButton("joinGameBtn");
  buttonStyler(addBtn, "Join Remote Game");
  addBtn.onPointerUpObservable.add(() => {
    if (input.text === "" || Number.isNaN(Number(input.text)))
      input.background = "rgba(255, 110, 110, 1)";
    else {
      // console.log("the input number is ", Number(input.text))
      mainUI.rootContainer.isVisible = false;
      mainUI.isForeground = false;
      multiUI.rootContainer.isVisible = false;
      multiUI.isForeground = false;
      resumeUI.rootContainer.isVisible = false;
      resumeUI.isForeground = false;
      remoteUI.rootContainer.isVisible = false;
      remoteUI.isForeground = false;

      setPlayerCount(2);
      setPlayerName(["Player1", "Player2"]);
      let newGame: NewGame = {
        type: "newGame",
        playerCount: 2,
        mode: 1,
        gameId: Number(input.text),
        playername: [username, "player2"]
      }
      // console.log("new game created ", newGame)
      setNewGame(newGame);

      if (disposableUI) {
        disposeDUI();
      }
    }
  });
  return addBtn;
}

export function createCyberBtn(): Button {
  const cyberBtn = Button.CreateSimpleButton("cyberBtn");
  buttonStyler(cyberBtn, "cyber view");
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
        // console.log("there is not light")
      light.intensity = 0;
      colorType = 0;
    }
  });
  return cyberBtn;
}
export function createNaturalBtn(): Button {
  const naturalBtn = Button.CreateSimpleButton("naturalBtn");
  buttonStyler(naturalBtn, "natural view");
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
      // if (!light)
        // console.log("there is not light")
      light.intensity = 0.9;
      colorType = 1;
    }
  });
  return naturalBtn;
}

export function createDefaultBtn(): Button {
  const defaultBtn = Button.CreateSimpleButton("defaultBtn");
  buttonStyler(defaultBtn, "default settings");
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
    // if (!light)
      // console.log("there is not light")
    light.intensity = defaultSettings.lightIntensity;
    colorType = defaultSettings.colorType;
  });
  return defaultBtn;
}
