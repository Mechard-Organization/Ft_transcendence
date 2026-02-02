/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLogic.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/09 14:01:28 by ajamshid          #+#    #+#             */
/*   Updated: 2026/01/29 12:01:42 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { WebSocket as WS } from "ws";

let finalGoal = 1
const paddleHeight = 100, paddleSpeed = 6;
let gId = 0;

export interface WSMessage {
  type: "wsMessage"
  player: Player,
  newGame?: NewGame
}

interface Vec3 {
  x: number,
  y: number,
  z: number
}

interface Balld {
  radius: number;
  dx: number,
  dz: number,
  currentSpeed: number,
  beginSpeed: number,
  speedAfterHit: number
}

let tableWidth: number = 800;
let tableHeight: number = 600;


interface Paddles {
  paddle1: number,
  paddle2: number,
}

interface Player {
  type: "Player",
  username: string,
  gameId?: number,
  keys: any,
  pause: number,
  isDragging1: boolean,
  isDragging2: boolean,
  dragPos1: Vec3,
  dragPos2: Vec3,
  ws?: WS
}

let players: { [gameId: number]: Player } = {};

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
let talkerTemp: Talker[] = [];


interface Game {
  gameId: number,
  playerCount: number,
  mode: number,
  counter: number[],
  aiDirection: number,
  paddles: Paddles,
  balld: Balld,
  ballPos: Vec3,
  playerIds: number[],
  playername: string[],
  wallTop?: boolean,
  wallbottom?: boolean,
  wallright?: boolean,
  wallleft?: boolean
}

interface NewGame {
  type: "newGame",
  playerCount: number,
  mode: number,
  gameId?: number,
  playername: string[]
}

export let keysB: { [gameId: number]: any } = {};

let games: Game[] = []

// let Direction = 0;
//AI next position finder
export function AIDirection(game: Game) {
  let positionOnPaddle = Math.random() * 70;
  let difference = 0;
  let x = game.ballPos.x + (game.balld.dx * game.balld.currentSpeed * 58);
  if (!(x < tableWidth / 2 - 25 && x > -tableWidth / 2 + 25)) {
    if (x > 0)
      x = x - (tableWidth / 2 + 25);
    else x = x + (tableWidth / 2 - 25);
    difference = Math.abs(x / (game.balld.dx * game.balld.currentSpeed));
  }
  let i = game.ballPos.z + (game.balld.dz * game.balld.currentSpeed * (58 - difference)) + positionOnPaddle * (Math.random() > 0.5 ? 1 : -1);;
  while ((-tableHeight / 2) > i || (tableHeight / 2) < i) {
    if ((-tableHeight / 2) > i)
      i = (((i + tableHeight / 2) * -1) - (tableHeight / 2))
    else
      i = (((i - tableHeight / 2) * -1) + (tableHeight / 2))
  }
  return i;
}


function sinDeg(degrees: number) {
  return Math.sin(degrees * Math.PI / 180);
}
function cosDeg(degrees: number) {
  return Math.cos(degrees * Math.PI / 180);
}

export function moveBall(games: Game): Vec3 {
  let playerCount = games.playerCount;
  let paddle1X = tableWidth / 2 - 20;
  let paddle2X = -(tableWidth / 2) + 20;
  let wallLeftPosx = tableWidth / 2 + 5;
  let wallRightPosx = -tableWidth / 2 - 5;

  //move ball
  games.ballPos.x += games.balld.dx * games.balld.currentSpeed;
  games.ballPos.z += games.balld.dz * games.balld.currentSpeed;

  //top/bottom bounce
  if ((games.ballPos.z + games.balld.radius >= tableHeight / 2 && games.balld.dz > 0) || (games.ballPos.z - games.balld.radius <= -tableHeight / 2 && games.balld.dz < 0)) {
    games.balld.dz *= -1;
  }

  //paddle1 bounce
  if (games.ballPos.x + games.balld.radius >= paddle1X - 5 &&
    games.ballPos.z < (games.paddles.paddle1 + (paddleHeight / 2)) && games.ballPos.z > (games.paddles.paddle1 - (paddleHeight / 2))) {
    let angle = (tableHeight / 2 + games.ballPos.z) - (tableHeight / 2 + games.paddles.paddle1);
    let direction = (angle >= 0) ? 1 : -1;
    if (games.balld.dx > 0 && games.ballPos.x + games.balld.radius > paddle1X) {
      games.balld.dz = sinDeg(Math.abs(Math.trunc(angle)) * 1.5) * direction;
      games.balld.dx = cosDeg(Math.abs(Math.trunc(angle)) * 1.5) * -1;
    }
    games.balld.currentSpeed = games.balld.speedAfterHit;
  }

  //paddle2 bounce
  if (games.ballPos.x - games.balld.radius <= paddle2X + 5 &&
    games.ballPos.z < (games.paddles.paddle2 + (paddleHeight / 2)) && games.ballPos.z > (games.paddles.paddle2 - (paddleHeight / 2))) {
    let angle = (tableHeight / 2 + games.ballPos.z) - (tableHeight / 2 + games.paddles.paddle2);
    let direction = (angle >= 0) ? 1 : -1;
    if (games.balld.dx < 0 && games.ballPos.x - games.balld.radius < paddle2X) {
      games.balld.dz = sinDeg(Math.abs(Math.trunc(angle))) * direction;
      games.balld.dx = cosDeg(Math.abs(Math.trunc(angle)));
    }
    games.balld.currentSpeed = games.balld.speedAfterHit;
  }

  //wall colusion
  if (games.ballPos.x + games.balld.radius >= wallLeftPosx || games.ballPos.x - games.balld.radius <= wallRightPosx) {
    if (games.ballPos.x + games.balld.radius >= wallLeftPosx)
      games.counter[1]++;
    else
      games.counter[0]++;
    games.ballPos = { x: 0, y: games.balld.radius + 1, z: (Math.random() * 200) * (Math.random() > 0.5 ? 1 : -1) };
    games.balld.dx = cosDeg(45) * (Math.random() > 0.5 ? 1 : -1);
    games.balld.dz = sinDeg(45) * (Math.random() > 0.5 ? 1 : -1);
    games.balld.currentSpeed = games.balld.beginSpeed;
  }
  return games.ballPos;
}

export function movePaddles(games: Game): Paddles {
  let playerCount = games.playerCount;
  let keys = undefined;
  let isDragging1: boolean = false;
  let isDragging2: boolean = false;
  let dragPos1: Vec3 = { x: 0, y: 0, z: 0 };
  let dragPos2: Vec3 = { x: 0, y: 0, z: 0 };

  if (games.mode == 0) {
    let playerIndex = findPlayer(undefined, games.gameId);
    if (playerIndex == -1) {
      console.log("player not found mode = 0, gID ", games.gameId)
      if (keys == undefined)
        return (games.paddles);
    }
    else {
      keys = players[playerIndex].keys;
      isDragging2 = players[playerIndex].isDragging2;
      isDragging1 = players[playerIndex].isDragging1;
      dragPos1 = players[playerIndex].dragPos1;
      dragPos2 = players[playerIndex].dragPos2;

    }
  }

  if (games.mode == 1) {
    let playerIndex = findPlayer(games.playername[0]);
    if (playerIndex == -1 || games.playerIds[1] == 0 || games.playerIds[0] == 0) {
      console.log("player not found mode = 1, gID ", games.gameId)
      isDragging1 = false;
      keys = undefined;
    }
    else {
      keys = players[playerIndex].keys;
      isDragging2 = players[playerIndex].isDragging2;
      isDragging1 = players[playerIndex].isDragging1;
      dragPos1 = players[playerIndex].dragPos1;
      dragPos2 = players[playerIndex].dragPos2;
    }
  }

  let Direction = games.aiDirection;
  if (playerCount > 0) {
    if (isDragging1) {
      console.log("is dragging 1");
      if ((dragPos1.z < games.paddles.paddle1) && games.paddles.paddle1 > -tableHeight / 2 + 50) games.paddles.paddle1 -= paddleSpeed;
      if ((dragPos1.z > games.paddles.paddle1) && games.paddles.paddle1 < tableHeight / 2 - 50) games.paddles.paddle1 += paddleSpeed;
    }
    if (keys && keys["w"] && games.paddles.paddle1 > -tableHeight / 2 + 50) games.paddles.paddle1 -= paddleSpeed;
    if (keys && keys["s"] && games.paddles.paddle1 < tableHeight / 2 - 50) games.paddles.paddle1 += paddleSpeed;
  }
  else {
    if ((Direction < games.paddles.paddle1) && games.paddles.paddle1 > -tableHeight / 2 + 50 && games.balld.dx > 0) games.paddles.paddle1 -= paddleSpeed;
    if ((Direction > games.paddles.paddle1) && games.paddles.paddle1 < tableHeight / 2 - 50 && games.balld.dx > 0) games.paddles.paddle1 += paddleSpeed;
  }

  if (games.mode == 1) {

    let playerIndex = findPlayer(games.playername[1]);
    if (playerIndex == -1 || games.playerIds[1] == 0 || games.playerIds[0] == 0) {
      console.log("player not found mode = 1, gID ", games.gameId);
      isDragging2 = false;
      keys = undefined;
    }
    else {
      keys = players[playerIndex].keys;
      isDragging2 = players[playerIndex].isDragging2;
      isDragging1 = players[playerIndex].isDragging1;
      dragPos1 = players[playerIndex].dragPos1;
      dragPos2 = players[playerIndex].dragPos2;
    }
  }

  if (playerCount > 1) {
    if (isDragging2) {
      console.log("is gragging 2");
      if ((dragPos2.z < games.paddles.paddle2) && games.paddles.paddle2 > -tableHeight / 2 + 50) games.paddles.paddle2 -= paddleSpeed;
      if ((dragPos2.z > games.paddles.paddle2) && games.paddles.paddle2 < tableHeight / 2 - 50) games.paddles.paddle2 += paddleSpeed;
    }
    if (keys && keys["ArrowUp"] && games.paddles.paddle2 > -tableHeight / 2 + 50) games.paddles.paddle2 -= paddleSpeed;
    if (keys && keys["ArrowDown"] && games.paddles.paddle2 < tableHeight / 2 - 50) games.paddles.paddle2 += paddleSpeed;
  }
  else {
    if ((Direction < games.paddles.paddle2) && games.paddles.paddle2 > -tableHeight / 2 + 50 && games.balld.dx < 0) games.paddles.paddle2 -= paddleSpeed;
    if ((Direction > games.paddles.paddle2) && games.paddles.paddle2 < tableHeight / 2 - 50 && games.balld.dx < 0) games.paddles.paddle2 += paddleSpeed;
  }
  return games.paddles;
}

function findPlayer(username?: string, gId?: number): number {
  for (const gameId of Object.keys(players)) {
    const player = players[Number(gameId)];
    if (username != undefined && player.username == username)
      return Number(gameId);
    if (gId != undefined && player.gameId == gId)
      return Number(gameId);
  }
  return -1;
}

export function removePlayerByWS(ws: WS) {
  console.log("removebyws called on ")
  const player: Player | undefined = Object.values(players).find(player => player.ws === ws);
  console.log("removebyws called on ", player?.username)
  if (player) {

    const gameIndex = games.findIndex(g => g.gameId === player.gameId);
    let talkerindex = talkerTemp.findIndex(g => g.gameId === player.gameId);
    const playerIndex = findPlayer(player.username);
    console.log("removeOldAddNewGame calles player, GID ", player.username, gameIndex, games[gameIndex])
    if (games[gameIndex] != undefined) {
      if (games[gameIndex].mode == 0 || games[gameIndex].playername[0] == player.username)
        games[gameIndex].playerIds[0] = 0;
      if (games[gameIndex].mode == 0 || games[gameIndex].playername[1] == player.username)
        games[gameIndex].playerIds[1] = 0;
    }
    if (games[gameIndex] != undefined && games[gameIndex].playerIds[0] == 0 && games[gameIndex].playerIds[1] == 0) {
      console.log("removed game", games[gameIndex].gameId);
      games.splice(gameIndex, 1);
      talkerTemp.splice(talkerindex, 1);

    }
    console.log("deleted player ", players[playerIndex].username)
    delete players[playerIndex];
  }
}

function createNewGame(newGame?: NewGame) {

  if (newGame && newGame.mode == 1 && newGame?.gameId != undefined && games[newGame.gameId]) {
    if (games[newGame.gameId].playername[1] == newGame.playername[0])
      games[newGame.gameId].playerIds[1] = 1;
    console.log("mode: ", newGame?.mode, " gameId: ", newGame?.gameId, "playername: ", games[newGame.gameId].playerIds[1])
    return newGame.gameId;
  }

  const gameId = gId++;
  games.push({
    gameId,
    playerCount: newGame?.playerCount ?? 0,
    mode: newGame?.mode ?? 0,
    counter: [0, 0],
    aiDirection: 0,
    paddles: { paddle1: 0, paddle2: 0 },
    balld: {
      radius: 10,
      dx: cosDeg(45) * (Math.random() > 0.5 ? 1 : -1),
      dz: sinDeg(45) * (Math.random() > 0.5 ? 1 : -1),
      currentSpeed: 3,
      beginSpeed: 3,
      speedAfterHit: 6
    },
    ballPos: { x: 0, y: 11, z: (Math.random() * 200) * (Math.random() > 0.5 ? 1 : -1) },
    playerIds: [1, 0],
    playername: newGame?.playername ?? ["BOT", "BOT"]
  });


  const gameindex = games.length - 1;

  talkerTemp.push({
    type: "talker",
    gameId,
    paddles: games[gameindex].paddles,
    ballpos: games[gameindex].ballPos,
    counter: games[gameindex].counter,
    playername: games[gameindex].playername,
    playerCount: games[gameindex].playerCount
  });
  console.log("mode: ", games[gameindex].mode, " gameId: ", games[gameindex].gameId, "playername: ", games[gameindex].playername);
  if (newGame && newGame.mode == 1 && newGame?.gameId != undefined && !games[newGame.gameId]){
    talkerTemp[talkerTemp.length - 1].counter = games[gameindex].counter = [-1,-1]
  }
  return gameId;
}


export function removeOldAddNewGame(player: Player, gId: number) {
  const gameIndex = games.findIndex(g => g.gameId === player.gameId);
  let talkerindex = talkerTemp.findIndex(g => g.gameId === player.gameId);
  console.log("removeOldAddNewGame", gameIndex, talkerindex, "calles player, oldgame ", player.username, games[gameIndex])
  const playerIndex = findPlayer(player.username);
  if (games[gameIndex] != undefined) {
    console.log(games[gameIndex].playername[0], player.username)
    if (games[gameIndex].mode == 0 || games[gameIndex].playername[0] == player.username) {
      console.log("playerid 0 set to 0")
      games[gameIndex].playerIds[0] = 0;
    }
    if (games[gameIndex].mode == 0 || games[gameIndex].playername[1] == player.username) {
      games[gameIndex].playerIds[1] = 0;
    }
  }
  if (games[gameIndex] != undefined && games[gameIndex].playerIds[0] == 0 && games[gameIndex].playerIds[1] == 0) {
    console.log("removed game", games[gameIndex].gameId);
    games.splice(gameIndex, 1);
    talkerTemp.splice(talkerindex, 1);

  }
  if (gId >= 0)
    players[playerIndex].gameId = gId;
  console.log("new game is ", gId)
}

export function movePaddlesAndBalls(wsMessage: WSMessage) {
  let player: Player = wsMessage.player;
  let newGame: NewGame | undefined = wsMessage.newGame;
  const playerIndex = findPlayer(player.username)
  if (newGame && newGame.type == "newGame") {
    
    const gameId = createNewGame(newGame)
    console.log("game created new game given user ", player.username, gId, games[games.findIndex(g => g.gameId === gameId)]);
    removeOldAddNewGame(player, gameId);

    player.ws?.send(JSON.stringify(talkerTemp[talkerTemp.findIndex(g => g.gameId === gameId)]))
    return;
  }
  else if (playerIndex == -1) {
    const gameId = createNewGame()
    if (!player.username)
      player.username = `p${gameId}`
    player.gameId = gameId;
    players[gameId] = player
    console.log("game created new user ", player.username);
    player.ws?.send(JSON.stringify({ type: "Playername", username: player.username }))
    return;
  }
  else {
    players[playerIndex].pause = player.pause;
    players[playerIndex].keys = player.keys;
    players[playerIndex].isDragging1 = player.isDragging1;
    players[playerIndex].isDragging2 = player.isDragging2;
    players[playerIndex].dragPos1 = player.dragPos1;
    players[playerIndex].dragPos2 = player.dragPos2;
    return;
  }

}

setInterval(() => {
  let i = 0;
  while (games.length > i) {
    let talkerindex = talkerTemp.findIndex(g => g.gameId === games[i].gameId)
    let playerIndex = findPlayer(undefined, games[i].gameId)
    if (playerIndex != -1 && players[playerIndex].pause == 1 && games[i].mode == 0) {
      // console.log("game paused", i, "  ", talkerindex);
      i++;
      continue;
    }
    if (games[i].mode == 1 && (games[i].playerIds[0] == 0 || games[i].playerIds[1] == 0)) {
      // console.log("game paused", i, "  ", talkerindex);

      i++;
      continue;
    }
    games[i].paddles = movePaddles(games[i]);
    games[i].ballPos = moveBall(games[i]);
    talkerTemp[talkerindex].paddles = games[i].paddles
    talkerTemp[talkerindex].ballpos = games[i].ballPos;
    talkerTemp[talkerindex].counter = games[i].counter;


    if (games[i] && games[i].mode == 0) {
      let playerIndex = findPlayer(undefined, games[i].gameId);
      if (playerIndex == -1) {
        console.log("player not found mode = 0, gID ", games[i].gameId)

      }
      else {
        players[playerIndex].ws?.send(JSON.stringify(talkerTemp[talkerindex]));
        if (talkerTemp[talkerindex].counter[0] >= finalGoal || talkerTemp[talkerindex].counter[1] >= finalGoal) {
          removeOldAddNewGame(players[playerIndex], -1);
          continue;
        }
      }
    }
    if (games[i] && games[i].mode == 1) {
      let playerIndex = findPlayer(games[i].playername[0]);
      let playerIndex2 = findPlayer(games[i].playername[1]);
      if (playerIndex != -1) {
        players[playerIndex].ws?.send(JSON.stringify(talkerTemp[talkerindex]));
      }
      if (playerIndex2 != -1) {
        players[playerIndex2].ws?.send(JSON.stringify(talkerTemp[talkerindex]));
      }
      if (talkerTemp[talkerindex].counter[0] >= finalGoal || talkerTemp[talkerindex].counter[1] >= finalGoal) {
        removeOldAddNewGame(players[playerIndex], -1);
        removeOldAddNewGame(players[playerIndex2], -1);
        continue;
      }
    }
    i++;
  }
  i = 0;
}, 1000 / 60);


// 1 second loop
setInterval(() => {
  games.forEach(game => {
    game.aiDirection = AIDirection(game);
  });
}, 1000);
