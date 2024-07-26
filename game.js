// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

// Game variables
let snake;
let fruits; // Change the fruit variable to an array to store multiple fruits
let score;
let highScore;
let direction;
let gameInterval;
let backgroundImage; // Store the background image
let fruitImage; // Store the fruit image
let snakeImage; // Store the snake image
let isPaused = true;
let difficulty = 75; // Default difficulty (normal speed)

// Get canvas context
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

// Initialize the game
function init() {
  snake = [{ x: 10, y: 10 }];
  fruits = generateFruits(2); // Generate two fruits at the start of the game
  score = 0;
  highScore = parseInt(localStorage.getItem('highScore')) || 0;
  direction = DIRECTIONS.RIGHT;

  // Load the background image
  backgroundImage = new Image();
  backgroundImage.src = 'snakeBKG.jpg';

  // Load the fruit image
  fruitImage = new Image();
  fruitImage.src = 'fruit.png';

  // Load the snake image
  snakeImage = new Image();
  snakeImage.src = 'ball.png';

  // Start the game loop once all images are loaded
  Promise.all([
    new Promise((resolve) => {
      backgroundImage.addEventListener('load', resolve);
    }),
    new Promise((resolve) => {
      fruitImage.addEventListener('load', resolve);
    }),
    new Promise((resolve) => {
      snakeImage.addEventListener('load', resolve);
    }),
  ]).then(() => {
    draw(); // Draw the initial state of the game
  });

  document.getElementById('score').innerText = score;
  document.getElementById('highScore').innerText = highScore;
}

// Game loop with pause functionality
function gameLoop() {
  if (!isPaused) {
    update();
    draw();
  }
}

// Update game state
function update() {
  // Move snake
  const head = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case DIRECTIONS.UP:
      head.y -= 1;
      break;
    case DIRECTIONS.DOWN:
      head.y += 1;
      break;
    case DIRECTIONS.LEFT:
      head.x -= 1;
      break;
    case DIRECTIONS.RIGHT:
      head.x += 1;
      break;
  }

  // Check for game over conditions
  if (
    head.x < 0 ||
    head.x >= CANVAS_WIDTH / GRID_SIZE ||
    head.y < 0 ||
    head.y >= CANVAS_HEIGHT / GRID_SIZE ||
    snake.some((part, index) => index !== 0 && part.x === head.x && part.y === head.y)
  ) {
    clearInterval(gameInterval);
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').innerText = score;
    return;
  }

  // Check for fruit collision
  let fruitIndex = fruits.findIndex((fruit) => fruit.x === head.x && fruit.y === head.y);
  if (fruitIndex !== -1) {
    score += 10;
    highScore = Math.max(highScore, score);
    localStorage.setItem('highScore', highScore);
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = highScore;

    fruits.splice(fruitIndex, 1);
    fruits.push(generateFruit());
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

// Draw game objects
function draw() {
  // Draw background image
  ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw snake using the snake image
  snake.forEach((part) => {
    ctx.drawImage(snakeImage, part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });

  // Draw fruits using the fruit image
  fruits.forEach((fruit) => {
    ctx.drawImage(fruitImage, fruit.x * GRID_SIZE, fruit.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });
}

// Generate a single fruit at a random position
function generateFruit() {
  return {
    x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
    y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
  };
}

// Generate an array of fruits at random positions
function generateFruits(numFruits) {
  return Array.from({ length: numFruits }, generateFruit);
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      if (direction !== DIRECTIONS.DOWN) direction = DIRECTIONS.UP;
      break;
    case 'ArrowDown':
    case 's':
      if (direction !== DIRECTIONS.UP) direction = DIRECTIONS.DOWN;
      break;
    case 'ArrowLeft':
    case 'a':
      if (direction !== DIRECTIONS.RIGHT) direction = DIRECTIONS.LEFT;
      break;
    case 'ArrowRight':
    case 'd':
      if (direction !== DIRECTIONS.LEFT) direction = DIRECTIONS.RIGHT;
      break;
  }
});

// Handle touch input
let touchStartX, touchStartY;
document.addEventListener('touchstart', (event) => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

document.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== DIRECTIONS.LEFT) direction = DIRECTIONS.RIGHT;
    else if (dx < 0 && direction !== DIRECTIONS.RIGHT) direction = DIRECTIONS.LEFT;
  } else {
    if (dy > 0 && direction !== DIRECTIONS.UP) direction = DIRECTIONS.DOWN;
    else if (dy < 0 && direction !== DIRECTIONS.DOWN) direction = DIRECTIONS.UP;
  }
});

// Handle pause button
document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').src = isPaused ? 'start.png' : 'pause.png';
  if (!isPaused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, difficulty);
  } else {
    clearInterval(gameInterval);
  }
});

// Handle restart button in game over screen
document.getElementById('restartBtn2').addEventListener('click', () => {
  document.getElementById('gameOverScreen').style.display = 'none';
  init();
});

// Handle speed buttons
document.getElementById('slowBtn').addEventListener('click', () => {
  difficulty = 100;
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, difficulty);
});

document.getElementById('normalBtn').addEventListener('click', () => {
  difficulty = 75;
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, difficulty);
});

document.getElementById('fastBtn').addEventListener('click', () => {
  difficulty = 50;
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, difficulty);
});

// Initialize the game
init();