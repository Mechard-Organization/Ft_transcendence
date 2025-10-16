/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2025/10/15 15:06:32 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

let id: number;
let counter= [0, 0];

//Play page function
function game_page(): string {


  const app = document.getElementById("app")!;
  app.innerHTML = "";
  
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "enter participant alias";

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
  const player = { x: 20, y: canvas.height / 2 - 50, speed: 5};
  const ai = { x: canvas.width - 30, y: canvas.height / 2 - 50, speed: 5 };
  const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: (Math.random() > 0.5 ? 1 : -1), dy: (Math.random() > 0.5 ? 1 : -1), speed: 7};
  let score = {a: 0, b: 0};

  // Keyboard controls
  const keys: { [key: string]: boolean } = {};
  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);
  

  // Draw functions
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

  function drawNumber(text: number | string, player: number, fontName: string) {
        const fontSize = 50;
        ctx.font = `${fontSize}px ${fontName}`;
        ctx.fillStyle = 'white';

        const xPos = (player * (canvas.width / 2)) + (canvas.width / 4);
        const yPos = fontSize + 20;
        if(typeof(text) == 'number')
          ctx.fillText(text.toString(), xPos, yPos);
        else
          ctx.fillText(text, xPos, yPos);
      }

  // Game logic
  function movePaddles(count: number) {
    if (keys["w"] && player.y > 0) player.y -= player.speed;
    if (keys["s"] && player.y + paddleHeight < canvas.height) player.y += player.speed;
    if (count > 0){
      if (keys["ArrowUp"] && ai.y > 0) ai.y -= ai.speed;
      if (keys["ArrowDown"] && ai.y + paddleHeight < canvas.height) ai.y += ai.speed;
    }
    else{
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

    }

    if (ball.x + ball.radius > ai.x &&
        ball.y > ai.y && ball.y < ai.y + paddleHeight) {
      ball.dx *= -1;
      let paddleMiddle = ai.y + paddleHeight - 50;
      ball.dy = (ball.y - paddleMiddle) * 0.06;
    }

    // Reset if ball goes out
    if (ball.x <= player.x || ball.x >= ai.x) {
      if(ball.x <= player.x)
        counter[1]++;
      else
        counter[0]++;
      if(counter[0] === 10 || counter[1] === 10)
        return (1);
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = (Math.random() > 0.5 ? 1 : -1);
      ball.dy = (Math.random() > 0.5 ? 1 : -1);
    }
    return 0;
  }

  // Main draw
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player.x, player.y, paddleWidth, paddleHeight, "white");
    drawRect(ai.x, ai.y, paddleWidth, paddleHeight, "white");
    drawCircle(ball.x, ball.y, ball.radius, "white");
    if(counter[0] === 10 || counter[1] === 10){
        cancelAnimationFrame(id);
        if(counter[0] == 10)
          drawNumber("WIN", 0, "arial");
        else
          drawNumber("WIN", 1, "arial");
      }
    else{
      drawNumber(counter[0], 0, "arial");
      drawNumber(counter[1], 1, "arial");
    }
  }

  // Game loop
  function gameLoop(count: number) {
    app.appendChild(canvas);
    movePaddles(count);
    let status = moveBall();
    draw();
    if(status === 0)
      id = requestAnimationFrame(() => gameLoop(count));
  }
  //clear canvas
  function clearCanvas() {
    cancelAnimationFrame(id);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    counter[0] = 0;
    counter[1] = 0;
    input.value = "";
    app.innerHTML = "";
  }
  // main menue botton funtion
  function mainMenu(){
    clearCanvas();
    app.appendChild(singlePlayerBtn);
    app.appendChild(multiPlayerBtn);
    app.appendChild(mainMenuBtn);
  }

  // Start the game loop


  function gameTypeSelector(){
    clearCanvas();
    app.appendChild(tournamentBtn);
    app.appendChild(twoPlayerBtn);
    app.appendChild(mainMenuBtn);
  }


  // Attach button actions
  singlePlayerBtn.addEventListener("click", () => gameLoop(0));
  multiPlayerBtn.addEventListener("click", gameTypeSelector);
  twoPlayerBtn.addEventListener("click", () => gameLoop(1));
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
