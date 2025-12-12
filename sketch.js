// State & ml5
let video,
  handpose,
  predictions = [];

// Canvas & game
let canvas;
let balls = [];
let score = 0;
let gameState = "STOPPED"; // STOPPED | PLAYING | PAUSED | GAMEOVER

// Shot control
let lastShotTime = 0;
let shotDelay = 500; // ms

// Colors (esquerra=vermell, centre=blau, dreta=verd)
const COLOR_CONFIG = [
  { name: "VERD", fill: "#2ecc71" }, // dreta
  { name: "VERMELL", fill: "#e74c3c" }, // esquerra
  { name: "BLAU", fill: "#3498db" }, // centre
];

// Path params
let ballRadius = 20;
let ballSpacing = ballRadius * 2;
let pathProgress = 0;
let pathSpeed = 0.5;
const SPEED_FAST = 1.4;
const SPEED_SLOW = 0.25;
const SPEED_CURVE = 1.6;

function setup() {
  const s = Math.min(windowWidth, windowHeight) * 0.8;
  canvas = createCanvas(s, s);

  textFont("monospace");

  // Vídeo i Handpose
  video = createCapture(VIDEO, () => {
    handpose = ml5.handpose(video, () => {
      console.log("Handpose carregat!");
    });
    handpose.on("hand", (results) => {
      predictions = results;
    });
  });
  video.size(width, height);
  video.hide();

  // Botons
  const startBtn = select("#startBtn");
  const pauseBtn = select("#pauseBtn");
  if (startBtn)
    startBtn.mousePressed(() => {
      startGame();
      gameState = "PLAYING";
    });
  if (pauseBtn)
    pauseBtn.mousePressed(() => {
      gameState = gameState === "PAUSED" ? "PLAYING" : "PAUSED";
      pauseBtn.html(gameState === "PAUSED" ? "Resume" : "Pause");
    });
}

function startGame() {
  score = 0;
  balls = [];
  pathProgress = ballSpacing * 6;
  gameState = "PLAYING";

  const screenLength = height + 200;
  const numBalls = Math.ceil(screenLength / ballSpacing);
  for (let i = 0; i < numBalls; i++) {
    balls.push({
      colorIndex: Math.floor(Math.random() * COLOR_CONFIG.length),
      distanceFromFront: i * ballSpacing,
    });
  }
  updateScoreUI();
}

function draw() {
  // Fons vídeo amb mirall horitzontal i cantonades arrodonides
  push();
  translate(width, 0);
  scale(-1, 1);
  drawCameraRounded();
  pop();

  drawZones();
  drawHud();

  if (gameState !== "PLAYING") return;

  if (balls.length > 0) {
    const frontY = pathProgress - balls[0].distanceFromFront;
    if (frontY >= height - ballRadius * 1.2) {
      gameState = "GAMEOVER";
      drawGameOver();
      return;
    }
    pathSpeed = computePathSpeed(frontY);
  }

  pathProgress += pathSpeed;
  updateAndDrawBalls();
  checkBallsAtEnd();

  detectHandZone(); // dispara segons zona
  updateScoreUI();
}

// Camera rounded corners
function drawCameraRounded() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.roundRect(0, 0, width, height, 20);
  drawingContext.clip();
  image(video, 0, 0, width, height);
  drawingContext.restore();
}

// Zones UI
function drawZones() {
  const boxW = 110;
  const boxH = 50;
  const y = 18;

  textAlign(CENTER, CENTER);
  textSize(16);
  noStroke();

  // Esquerra = vermell
  fill(231, 76, 60, 170);
  rect(18, y, boxW, boxH, 12);
  fill(255);
  text("VERMELL", 18 + boxW / 2, y + boxH / 2);

  // Centre = blau
  fill(52, 152, 219, 170);
  rect(width / 2 - boxW / 2, y, boxW, boxH, 12);
  fill(255);
  text("BLAU", width / 2, y + boxH / 2);

  // Dreta = verd
  fill(46, 204, 113, 170);
  rect(width - boxW - 18, y, boxW, boxH, 12);
  fill(255);
  text("VERD", width - boxW / 2 - 18, y + boxH / 2);
}

// Detecció mà
function detectHandZone() {
  if (predictions.length === 0) return;

  const hand = predictions[0];
  const tip = hand.landmarks[8];

  // Invertim x per compensar el mirall visual
  let x = width - tip[0];
  let y = tip[1] + 30; // ajust vertical

  // Punt indicador
  fill(255, 255, 0);
  noStroke();
  ellipse(x, y, 14, 14);

  // Zones per x
  let chosenIndex;
  if (x < width / 3) {
    chosenIndex = 1; // esquerra → vermell
  } else if (x < (width / 3) * 2) {
    chosenIndex = 2; // centre → blau
  } else {
    chosenIndex = 0; // dreta → verd
  }

  // Cooldown de dispar
  if (millis() - lastShotTime > shotDelay) {
    shootWithColor(chosenIndex);
    lastShotTime = millis();
  }
}

// HUD dins canvas
function drawHud() {
  fill(0, 160);
  rect(10, height - 48, 180, 36, 10);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Puntuació: ${score}`, 20, height - 30);
}

// Score fora del canvas
function updateScoreUI() {
  const scoreDiv = select("#score");
  if (scoreDiv) scoreDiv.html("Puntuació: " + score);
}

// Game over UI
function drawGameOver() {
  fill(255, 60, 60);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("GAME OVER", width / 2, height / 2 - 50);

  textSize(22);
  fill(255);
  text(`Puntuació final: ${score}`, width / 2, height / 2 + 10);
}

// Game logic
function computePathSpeed(frontY) {
  let p = constrain(frontY / height, 0, 1);
  p = Math.pow(p, SPEED_CURVE);
  const eased = smoothstep(0, 1, p);
  return lerp(SPEED_FAST, SPEED_SLOW, eased);
}
function smoothstep(edge0, edge1, x) {
  const t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function getPathPosition(distance) {
  const t = distance / 100;
  const amplitude = width * 0.06;
  const x = width / 2 + Math.sin(t * 2) * amplitude;
  const y = distance;
  return { x, y };
}
function updateAndDrawBalls() {
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    const distance = pathProgress - ball.distanceFromFront;
    const pos = getPathPosition(distance);
    const currentRadius = i === 0 ? ballRadius * 1.5 : ballRadius;

    noStroke();
    fill(COLOR_CONFIG[ball.colorIndex].fill);
    circle(pos.x, pos.y, currentRadius * 2);

    if (i === 0) {
      stroke(255, 200);
      strokeWeight(3);
      noFill();
      circle(pos.x, pos.y, currentRadius * 2 + 5);
    }
  }
}
function checkBallsAtEnd() {
  if (balls.length === 0) return;
  const frontBall = balls[0];
  const distance = pathProgress - frontBall.distanceFromFront;
  if (distance > height + ballRadius * 2) {
    const removedBall = balls.shift();
    const lastBall = balls[balls.length - 1];
    if (!lastBall) return;
    removedBall.distanceFromFront = lastBall.distanceFromFront + ballSpacing;
    removedBall.colorIndex = Math.floor(Math.random() * COLOR_CONFIG.length);
    balls.push(removedBall);
  }
}

function shootWithColor(colorIndex) {
  if (balls.length === 0) return;
  const frontBall = balls[0];
  const lastBall = balls[balls.length - 1];

  if (frontBall.colorIndex === colorIndex) {
    balls.shift();
    score += 5;
  } else {
    score = max(0, score - 1);
  }

  const newBall = {
    colorIndex: floor(random(COLOR_CONFIG.length)),
    distanceFromFront: lastBall ? lastBall.distanceFromFront + ballSpacing : 0,
  };
  balls.push(newBall);
}

function drawHud() {
  fill(0, 180);
  rect(10, height - 50, 180, 40, 10);
  fill(255);
  textSize(18);
  textAlign(LEFT, CENTER);
  text(`Puntuació: ${score}`, 20, height - 30);
}

function drawGameOver() {
  fill(255, 60, 60);
  textAlign(CENTER, CENTER);
  textSize(50);
  text("GAME OVER", width / 2, height / 2 - 60);

  textSize(25);
  fill(255);
  text(`Puntuació final: ${score}`, width / 2, height / 2);
}
function drawCameraRounded() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.roundRect(0, 0, width, height, 30); // radi 30px
  drawingContext.clip();
  image(video, 0, 0, width, height);
  drawingContext.restore();
}
