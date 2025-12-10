/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameLogic.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/09 14:01:28 by ajamshid          #+#    #+#             */
/*   Updated: 2025/12/07 17:18:58 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Vector3 } from "@babylonjs/core";
import { drawText, playerCount, finalGoal, createUI, pause, resetGame2, createdisposableUI } from "../ts/UI";
import { isDragging1, isDragging2, dragPos1, dragPos2} from "./Meshes";

export const paddleWidth = 10, paddleHeight = 100, paddleSpeed = 6;
export const wallHeight = 20;
export const balld = { radius: 10, dx: cosDeg(45) * (Math.random() > 0.5 ? 1 : -1), dz: sinDeg(45) * (Math.random() > 0.5 ? 1 : -1), currentSpeed: 3, beginSpeed: 3, speedAfterHit: 6 };
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


const keys: { [key: string]: boolean } = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
export const canvas = document.createElement("canvas");
canvas.id = "gameCanvas";
canvas.width = 800;
canvas.height = 600;
canvas.style.background = "black";
canvas.style.display = "block";
canvas.style.margin = "0 auto";

let Direction = 0;
//AI next position finder
export function AIDirection(ball: any) {
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
}



export function movePaddles(scene: any) {
  const paddle1 = scene.getMeshByName("paddle1");
  const paddle2 = scene.getMeshByName("paddle2");
  if (playerCount > 0) {
    if (isDragging1) {
      console.log("is dragging 1");
      if ((dragPos1.z < paddle1.position.z) && paddle1.position.z > -canvas.height / 2 + 50) paddle1.position.z -= paddleSpeed;
      if ((dragPos1.z > paddle1.position.z) && paddle1.position.z < canvas.height / 2 - 50) paddle1.position.z += paddleSpeed;
    }
    if (keys["w"] && paddle1.position.z > -canvas.height / 2 + 50) paddle1.position.z -= paddleSpeed;
    if (keys["s"] && paddle1.position.z < canvas.height / 2 - 50) paddle1.position.z += paddleSpeed;
  }
  else {
    if ((Direction < paddle1.position.z) && paddle1.position.z > -canvas.height / 2 + 50 && balld.dx > 0) paddle1.position.z -= paddleSpeed;
    if ((Direction > paddle1.position.z) && paddle1.position.z < canvas.height / 2 - 50 && balld.dx > 0) paddle1.position.z += paddleSpeed;
  }

  if (playerCount > 1) {
    if (isDragging2) {
      console.log("is gragging 2");
      if ((dragPos2.z < paddle2.position.z) && paddle2.position.z > -canvas.height / 2 + 50) paddle2.position.z -= paddleSpeed;
      if ((dragPos2.z > paddle2.position.z) && paddle2.position.z < canvas.height / 2 - 50) paddle2.position.z += paddleSpeed;
    }
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

export function moveBall(scene: any): number {
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

