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
const FRUIT_TYPES = {
  NORMAL: 'normal',
  CHERRY: 'cherry',
  BLUEBERRY: 'blueberry',
};
const FRUIT_PROBABILITIES = {
  NORMAL: 0.7,
  CHERRY: 0.2,
  BLUEBERRY: 0.1,
};

// Array of fun facts
const funFacts = [
  "Snakes can smell with their tongues.",
  "The longest snake in the world is the reticulated python.",
  "Snakes shed their skin to allow for further growth.",
  "Snakes are found on every continent except Antarctica.",
  "Some snakes can go without food for months.",
  "Snakes have no eyelids.",
  "The venom of the inland taipan can kill 100 adult humans.",
  "Snakes are cold-blooded animals.",
  "The smallest snake in the world is the thread snake.",
  "Snakes use their forked tongues to detect chemicals in the air.",
"Some snakes can glide through the air, like the flying snake.",
"There are over 3,000 species of snakes worldwide.",
"Snakes do not have external ears; they hear through vibrations in their jawbones.",
"The black mamba can reach speeds of up to 12 miles per hour.",
"Snakes can dislocate their jaws to swallow prey larger than their head.",
"The king cobra is the world's longest venomous snake.",
"Snakes have flexible skulls that allow them to consume large prey.",
"Anacondas are the heaviest snakes in the world.",
"Snakes' eyes are always open as they do not have eyelids.",
"The hognose snake can play dead to avoid predators.",
"Some sea snakes can breathe partially through their skin.",
"Snakes use their scales to help them move.",
"The gaboon viper has the longest fangs of any snake, measuring up to 2 inches.",
"Rattlesnakes can control the amount of venom they inject.",
"The boa constrictor kills its prey by constriction, not venom.",
"Some snakes give birth to live young instead of laying eggs.",
"Snakes can enter a state of brumation, similar to hibernation.",
"The milk snake mimics the coloration of the venomous coral snake.",
"Snakes have a unique organ called Jacobson's organ for detecting scent particles.",
"The copperhead snake can give off a cucumber-like smell when threatened."
];

// Game variables
let snake;
let fruits;
let score;
let highScore;
let direction;
let gameInterval;
let backgroundImage;
let fruitImages = {};
let snakeImage;
let isPaused = true;
let difficulty = 75;

// Get canvas context
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

// Initialize the game
function init() {
  snake = [{ x: 10, y: 10 }];
  fruits = generateFruits(2);
  score = 0;
  highScore = parseInt(localStorage.getItem('highScore')) || 0;
  direction = DIRECTIONS.RIGHT;

  // Load the background image
  backgroundImage = new Image();
  backgroundImage.src = 'snakeBKG.jpg';

  // Load the fruit images
  fruitImages[FRUIT_TYPES.NORMAL] = new Image();
  fruitImages[FRUIT_TYPES.NORMAL].src = 'fruit.png';

  fruitImages[FRUIT_TYPES.CHERRY] = new Image();
  fruitImages[FRUIT_TYPES.CHERRY].src = 'cherry.png';

  fruitImages[FRUIT_TYPES.BLUEBERRY] = new Image();
  fruitImages[FRUIT_TYPES.BLUEBERRY].src = 'berry.png';

  // Load the snake image
  snakeImage = new Image();
  snakeImage.src = 'ball.png';

  // Start the game loop once all images are loaded
  Promise.all(
    Object.values(fruitImages).map((image) => {
      return new Promise((resolve) => {
        image.addEventListener('load', resolve);
      });
    })
  )
    .then(() => {
      draw();
    })
    .catch((error) => {
      console.error('Error loading images:', error);
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
    gameOver();
    return;
  }

  // Check for fruit collision
  let fruitIndex = fruits.findIndex((fruit) => fruit.x === head.x && fruit.y === head.y);
  if (fruitIndex !== -1) {
    const fruit = fruits[fruitIndex];
    switch (fruit.type) {
      case FRUIT_TYPES.NORMAL:
        score += 10;
        snake.push({ ...snake[snake.length - 1] });
        break;
      case FRUIT_TYPES.CHERRY:
        score += 10;
        for (let i = 0; i < 3; i++) {
          snake.push({ ...snake[snake.length - 1] });
        }
        break;
      case FRUIT_TYPES.BLUEBERRY:
        score += 25;
        snake.push({ ...snake[snake.length - 1] });
        break;
    }

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
  ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  snake.forEach((part) => {
    ctx.drawImage(snakeImage, part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });

  fruits.forEach((fruit) => {
    ctx.drawImage(
      fruitImages[fruit.type],
      fruit.x * GRID_SIZE,
      fruit.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );
  });
}

// Generate a single fruit at a random position with a random type
function generateFruit() {
  const type = Math.random() < FRUIT_PROBABILITIES.NORMAL
    ? FRUIT_TYPES.NORMAL
    : Math.random() < FRUIT_PROBABILITIES.CHERRY + FRUIT_PROBABILITIES.NORMAL
    ? FRUIT_TYPES.CHERRY
    : FRUIT_TYPES.BLUEBERRY;

  return {
    type,
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

// Function to get a random fun fact
function getRandomFunFact() {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}

// Handle game over
function gameOver() {
  clearInterval(gameInterval);
  document.getElementById('gameOverScreen').style.display = 'block';
  document.getElementById('finalScore').innerText = score;
  document.getElementById('funFact').innerText = getRandomFunFact(); // Display a random fun fact
}

// Initialize the game
init();
