/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2025/10/24 15:09:07 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// type User = { name: string; age: number };
let contestents: string[] = [];
let loosers: string[] = [];
let finalGoal: number = 10;
function shuffle(array: string[]){
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index 0 ≤ j ≤ i
    [array[i], array[j]] = [array[j], array[i]];   // swap elements
  }
  return array;
}


let id: number;
let counter = [0, 0];

//Play page function
function game_page(): string {


  const app = document.getElementById("app")!;
  app.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "enter participant alias";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add participant";
  addBtn.style.margin = "10px"

  const finalizeBtn = document.createElement("button");
  finalizeBtn.textContent = "finalize";
  finalizeBtn.style.margin = "10px"
  
  // buttons
  const singlePlayerBtn = document.createElement("button");
  singlePlayerBtn.textContent = "Single Player";
  singlePlayerBtn.style.margin = "10px"

  const multiPlayerBtn = document.createElement("button");
  multiPlayerBtn.textContent = "Multi Player";
  multiPlayerBtn.style.margin = "10px"

  const twoPlayerBtn = document.createElement("button");
  twoPlayerBtn.textContent = "Two players";
  twoPlayerBtn.style.margin = "10px"

  const tournamentBtn = document.createElement("button");
  tournamentBtn.textContent = "Tournament";
  tournamentBtn.style.margin = "10px"

  const mainMenuBtn = document.createElement("button");
  mainMenuBtn.textContent = "Main menu";
  mainMenuBtn.style.margin = "10px"

  // canvas
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.background = "black";
  canvas.style.display = "block";
  canvas.style.margin = "0 auto";

  const ctx = canvas.getContext("2d")!;

  //game settings
  const paddleWidth = 10, paddleHeight = 100;
  const player = { x: 20, y: canvas.height / 2 - 50, speed: 7 };
  const ai = { x: canvas.width - 30, y: canvas.height / 2 - 50, speed: 4 };
  const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: (Math.random() > 0.5 ? 1 : -1), dy: (Math.random() > 0.5 ? 1 : -1), speed: 3 };
  let score = { a: 0, b: 0 };

  // Keyboard controls
  const keys: { [key: string]: boolean } = {};
  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);


  // Game logic
  function movePaddles(playerCount: number) {
    if (keys["w"] && player.y > 0) player.y -= player.speed;
    if (keys["s"] && player.y + paddleHeight < canvas.height) player.y += player.speed;
    if (playerCount > 0) {
      if (keys["ArrowUp"] && ai.y > 0) ai.y -= ai.speed;
      if (keys["ArrowDown"] && ai.y + paddleHeight < canvas.height) ai.y += ai.speed;
    }
    else {
      if (ball.y < ai.y + paddleHeight / 2) ai.y -= ai.speed;
      if (ball.y > ai.y + paddleHeight / 2) ai.y += ai.speed;

    }
  }

  function moveBall(): number {
    ball.x += ball.dx * ball.speed;
    ball.y += ball.dy * ball.speed;

    // Top/bottom bounce
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
      ball.dy *= -1;
    }

    // Paddle collisions
    if (ball.x - ball.radius <= player.x + paddleWidth &&
      ball.y > player.y && ball.y < player.y + paddleHeight) {
      ball.dx *= -1;
      let paddleMiddle = player.y + paddleHeight - 50;
      ball.dy = (ball.y - paddleMiddle) * 0.02;
      ball.speed = 7;
    }

    if (ball.x + ball.radius > ai.x &&
      ball.y > ai.y && ball.y < ai.y + paddleHeight) {
      ball.dx *= -1;
      let paddleMiddle = ai.y + paddleHeight - 50;
      ball.dy = (ball.y - paddleMiddle) * 0.06;
      ball.speed = 7;
    }

    // Reset if ball goes out
    if (ball.x <= player.x - 1 || ball.x >= ai.x) {
      if (ball.x <= player.x)
        counter[1]++;
      else
        counter[0]++;
      if (counter[0] === finalGoal)
        return (1);
      if(counter[1] === finalGoal)
        return (0);
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = (Math.random() > 0.5 ? 1 : -1);
      ball.dy = (Math.random() > 0.5 ? 1 : -1);
      ball.speed = 3;
    }
    return 2;
  }

    function drawRect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawCircle(x: number, y: number, r: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
      drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
    }
  }

  function drawText(text: number | string, player: number, playerName?: string) {
    let fontSize = 20;
    ctx.font = `${fontSize}px arial`;
    ctx.fillStyle = 'white';
    if(playerName !== undefined){
      const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
      const yPos = 20;
      ctx.fillText(playerName, xPos, yPos);
    }
    
    fontSize = 50;
    ctx.font = `${fontSize}px arial`;
    const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
    const yPos = fontSize + 30;
    if (typeof (text) == 'number')
      ctx.fillText(text.toString(), xPos, yPos);
    else
      ctx.fillText(text, xPos, yPos);
  }
  
  function draw(player1?: string, player2?:string) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player.x, player.y, paddleWidth, paddleHeight, "white");
    drawRect(ai.x, ai.y, paddleWidth, paddleHeight, "white");
    drawCircle(ball.x, ball.y, ball.radius, "white");
    if (counter[0] === finalGoal || counter[1] === finalGoal) {
      cancelAnimationFrame(id);
      if (counter[0] == finalGoal)
        drawText("WIN", 0, player1);
      else
        drawText("WIN", 1, player2);
      counter[0] = 0;
      counter[1] = 0;
    }
    else {
      drawText(counter[0], 0, player1);
      drawText(counter[1], 1, player2);
    }
  }

  // Game loop
  function gameLoop(playerCount: number, player1?: string, player2?:string, resolve?: (winnerIndex: number) => void) {
    movePaddles(playerCount);
    let status = moveBall();
    draw(player1, player2);
    if (status === 2)
      id = requestAnimationFrame(() => gameLoop(playerCount, player1, player2, resolve));
    else if (resolve) 
      resolve(status); 
  }
  //clear canvas
  function clearCanvas() {
    cancelAnimationFrame(id);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    counter[0] = 0;
    counter[1] = 0;
    player.x = 20; player.y= canvas.height / 2 - 50; player.speed= 7;
    ai.x = canvas.width - 30; ai.y= canvas.height / 2 - 50; ai.speed= 4;
    ball.x = canvas.width / 2; ball.y= canvas.height / 2; ball.radius= 10; ball.dx= (Math.random() > 0.5 ? 1 : -1); ball.dy= (Math.random() > 0.5 ? 1 : -1); ball.speed= 3;
    input.value = "";
    app.innerHTML = "";
    ball.speed = 3;
  }
  // main menue botton funtion
  function mainMenu() {
    clearCanvas();
    app.appendChild(singlePlayerBtn);
    app.appendChild(multiPlayerBtn);
    app.appendChild(mainMenuBtn);
  }

  // Start the game loop


  function gameTypeSelector() {
    clearCanvas();
    app.appendChild(tournamentBtn);
    app.appendChild(twoPlayerBtn);
    app.appendChild(mainMenuBtn);
  }

  function play(playerCount: number, player1?:string, player2?:string):Promise<number> {
    return new Promise((resolve) => {
    cancelAnimationFrame(id);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.x = 20; player.y= canvas.height / 2 - 50; player.speed= 7;
    ai.x = canvas.width - 30; ai.y= canvas.height / 2 - 50; ai.speed= 4;
    ball.x = canvas.width / 2; ball.y= canvas.height / 2; ball.radius= 10; ball.dx= (Math.random() > 0.5 ? 1 : -1); ball.dy= (Math.random() > 0.5 ? 1 : -1); ball.speed= 3;
    counter[0] = 0;
    counter[1] = 0;
    ball.speed = 3;
    if (!app.contains(canvas))
      app.appendChild(canvas);
    gameLoop(playerCount, player1, player2, resolve);
    });
  }

function waitForStart(): Promise<void> {
  return new Promise<void>((resolve) => {
    const startBtn = document.createElement("button");
      startBtn.textContent = "START";
      startBtn.style.margin = "10px"
      app.appendChild(startBtn);
      startBtn.addEventListener('click', () => {
      resolve();
    }, { once: true });
  });
}
function waitForContinue(): Promise<void> {
  return new Promise<void>((resolve) => {
    const startBtn = document.createElement("button");
      startBtn.textContent = "CONTINUE";
      startBtn.style.margin = "10px"
      app.appendChild(startBtn);
      startBtn.addEventListener('click', () => {
      resolve();
    }, { once: true });
  });
}


  function Tournament(){
    clearCanvas();
    app.appendChild(mainMenuBtn);
    app.appendChild(input);
    app.appendChild(addBtn);
    app.appendChild(finalizeBtn);
    // app.innerHTML += `<div id="contestent box" style="text-align=left"></div> `;
  }
  
  function add(){
    if(input.value === "")
      input.style.backgroundColor = "red";
    else {
      const p = document.createElement("p");
      p.textContent = `${input.value}`;
      app.appendChild(p);
      input.style.backgroundColor = "white";
      contestents.push(input.value);
      input.value = "";
    }
  }
  
  async function finalize(){
    if (contestents.length > 1){
      contestents = shuffle(contestents);
      
      while(contestents.length != 1){
        for(let i = 0; i < (contestents.length -1); i++){
          clearCanvas();
          app.appendChild(tournamentBtn);
          app.appendChild(twoPlayerBtn);
          app.appendChild(mainMenuBtn);
          const p = document.createElement("p");
          p.textContent = `${contestents[i]} VS ${contestents[i+1]}`;
          app.appendChild(p);
          await waitForStart();
          const looser = await play(1, contestents[i], contestents[i+1]);
          contestents.splice(i+looser, 1);
          await waitForContinue();
        }
      }
    }
  }

  // Attach button actions
  singlePlayerBtn.addEventListener("click", () => play(0));
  multiPlayerBtn.addEventListener("click", gameTypeSelector);
  twoPlayerBtn.addEventListener("click", () => play(1));
  tournamentBtn.addEventListener("click", Tournament);
  addBtn.addEventListener("click", add);
  finalizeBtn.addEventListener("click", finalize);
  mainMenuBtn.addEventListener("click", mainMenu);
  
  

  mainMenu();
  // Return empty string because canvas is appended dynamically
  return "";
}


const app = document.getElementById("app");

//main function that selects the page asked
function showPage(page: string) {
  const app = document.getElementById("app");
  if (!app) return;

  cancelAnimationFrame(id);
  app.innerHTML = "";

  if (page === "home") {
    app.innerHTML = "<h1>Home</h1>";
  } else if (page === "about") {
    app.innerHTML = "<h1>About</h1>";
  } else if (page === "game") {
    game_page();
  } else {
    app.innerHTML = "<h1>Page not found</h1>";
  }
}


// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
