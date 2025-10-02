class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('highScore');
    this.gameOverElement = document.getElementById('gameOver');
    this.finalScoreElement = document.getElementById('finalScore');
    this.playerNameInput = document.getElementById('playerName');
    this.leaderboardList = document.getElementById('leaderboardList');

    // Game settings
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    // Game state
    this.snake = [{ x: 10, y: 10 }];
    this.food = { x: 15, y: 15 };
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.highScore = localStorage.getItem('snakeHighScore') || 0;
    this.gameRunning = false;
    this.gameStarted = false;
    this.currentFact = '';
    this.factDisplayTime = 0;

    // Snake facts array
    this.snakeFacts = [
      "🐍 Snakes can't blink! They have transparent scales over their eyes instead of eyelids.",
      '🐍 The longest snake ever recorded was a reticulated python measuring 32 feet long!',
      '🐍 Snakes smell with their tongues by collecting chemical information from the air.',
      '🐍 Some snakes can go up to a year without eating after a large meal.',
      '🐍 The smallest snake in the world is the thread snake, only 4 inches long!',
      '🐍 Snakes shed their entire skin in one piece, like taking off a sock.',
      '🐍 Sea snakes can hold their breath underwater for up to 8 hours.',
      '🐍 The fastest snake is the black mamba, which can slither at 12 mph.',
      '🐍 Snakes have flexible jaws that can unhinge to swallow prey larger than their head.',
      '🐍 Some snakes, like pythons, have heat-sensing organs to detect warm-blooded prey.',
      '🐍 The king cobra is the longest venomous snake, reaching up to 18 feet.',
      '🐍 Snakes are found on every continent except Antarctica.',
      "🐍 A group of snakes is called a 'den', 'nest', or 'pit'.",
      '🐍 Snakes have been around for over 100 million years!',
      "🐍 The inland taipan has the most toxic venom, but it's very shy and rarely bites humans.",
      '🐍 Some snakes can fly! Flying snakes glide between trees by flattening their bodies.',
      "🐍 Snakes don't have ears, but they can feel vibrations through their jawbones.",
      '🐍 The heaviest snake is the green anaconda, which can weigh over 500 pounds!',
      "🐍 Baby snakes are called 'snakelets' or 'neonates'.",
      '🐍 Some snakes give birth to live young, while others lay eggs.',
    ];

    this.init();
  }

  init() {
    this.highScoreElement.textContent = this.highScore;
    this.setupEventListeners();
    this.loadLeaderboard();
    this.draw();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameStarted) {
        this.startGame();
      }
      this.changeDirection(e);
    });

    // Mobile touch controls
    this.setupMobileControls();

    document.getElementById('submitScore').addEventListener('click', () => {
      this.submitScore();
    });

    document.getElementById('restartGame').addEventListener('click', () => {
      this.restartGame();
    });

    // Allow Enter key to submit score
    this.playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.submitScore();
      }
    });
  }

  setupMobileControls() {
    // Touch/tap controls - tap different areas to change direction
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      if (!this.gameRunning) return;

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const tapX = touch.clientX - rect.left;
      const tapY = touch.clientY - rect.top;

      this.handleCanvasClick(tapX, tapY);
    });

    // Click/tap controls for desktop and mobile
    this.canvas.addEventListener('click', (e) => {
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      if (!this.gameRunning) return;

      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      this.handleCanvasClick(clickX, clickY);
    });

    // Prevent scrolling when touching the canvas
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    });
  }

  handleCanvasClick(clickX, clickY) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const deltaX = clickX - centerX;
    const deltaY = clickY - centerY;

    // Determine which direction based on click position
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal click
      if (deltaX > 0) {
        this.changeDirectionByInput('right');
      } else {
        this.changeDirectionByInput('left');
      }
    } else {
      // Vertical click
      if (deltaY > 0) {
        this.changeDirectionByInput('down');
      } else {
        this.changeDirectionByInput('up');
      }
    }
  }

  changeDirectionByInput(direction) {
    if (!this.gameRunning) return;

    const goingUp = this.dy === -1;
    const goingDown = this.dy === 1;
    const goingRight = this.dx === 1;
    const goingLeft = this.dx === -1;

    switch (direction) {
      case 'left':
        if (!goingRight) {
          this.dx = -1;
          this.dy = 0;
        }
        break;
      case 'up':
        if (!goingDown) {
          this.dx = 0;
          this.dy = -1;
        }
        break;
      case 'right':
        if (!goingLeft) {
          this.dx = 1;
          this.dy = 0;
        }
        break;
      case 'down':
        if (!goingUp) {
          this.dx = 0;
          this.dy = 1;
        }
        break;
    }
  }

  startGame() {
    if (this.gameRunning) return;

    this.gameRunning = true;
    this.gameStarted = true;
    this.gameLoop();
  }

  changeDirection(e) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (!this.gameRunning) return;

    const keyPressed = e.keyCode;
    const goingUp = this.dy === -1;
    const goingDown = this.dy === 1;
    const goingRight = this.dx === 1;
    const goingLeft = this.dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
      this.dx = -1;
      this.dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
      this.dx = 0;
      this.dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
      this.dx = 1;
      this.dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
      this.dx = 0;
      this.dy = 1;
    }
  }

  gameLoop() {
    if (!this.gameRunning) return;

    setTimeout(() => {
      this.clearCanvas();
      this.moveSnake();
      this.drawFood();
      this.drawSnake();
      this.drawFact();

      if (this.checkGameOver()) {
        this.endGame();
        return;
      }

      this.gameLoop();
    }, 40);
  }

  clearCanvas() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  moveSnake() {
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
    this.snake.unshift(head);

    // Check if food is eaten
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.scoreElement.textContent = this.score;
      this.generateFood();

      // Show random snake fact
      this.showRandomFact();

      // Update high score
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreElement.textContent = this.highScore;
        localStorage.setItem('snakeHighScore', this.highScore);
      }
    } else {
      this.snake.pop();
    }
  }

  drawSnake() {
    this.ctx.fillStyle = '#4CAF50';
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Draw head differently
        this.ctx.fillStyle = '#66BB6A';
      } else {
        this.ctx.fillStyle = '#4CAF50';
      }
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });
  }

  drawFood() {
    this.ctx.fillStyle = '#FF5722';
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  generateFood() {
    this.food = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount),
    };

    // Make sure food doesn't spawn on snake
    for (let segment of this.snake) {
      if (segment.x === this.food.x && segment.y === this.food.y) {
        this.generateFood();
        return;
      }
    }
  }

  checkGameOver() {
    const head = this.snake[0];

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      return true;
    }

    // Check self collision
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true;
      }
    }

    return false;
  }

  endGame() {
    this.gameRunning = false;
    this.finalScoreElement.textContent = this.score;
    this.gameOverElement.style.display = 'block';
    this.playerNameInput.focus();
  }

  async submitScore() {
    const playerName = this.playerNameInput.value.trim();
    if (!playerName) {
      alert('Please enter your name!');
      return;
    }

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          score: this.score,
        }),
      });

      if (response.ok) {
        this.loadLeaderboard();
        // Hide the score submission form but keep the Play Again button visible
        this.playerNameInput.style.display = 'none';
        document.getElementById('submitScore').style.display = 'none';
        this.playerNameInput.value = '';

        // Show a success message
        const gameOverDiv = document.getElementById('gameOver');
        const successMsg =
          gameOverDiv.querySelector('.success-message') ||
          document.createElement('p');
        successMsg.className = 'success-message';
        successMsg.textContent = '✅ Score submitted successfully!';
        successMsg.style.color = '#4CAF50';
        successMsg.style.fontWeight = 'bold';
        successMsg.style.margin = '10px 0';

        if (!gameOverDiv.querySelector('.success-message')) {
          gameOverDiv.insertBefore(
            successMsg,
            document.getElementById('restartGame')
          );
        }
      } else {
        alert('Failed to submit score. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    }
  }

  async loadLeaderboard() {
    try {
      const response = await fetch('/api/scores');
      const scores = await response.json();

      this.leaderboardList.innerHTML = '';

      if (scores.length === 0) {
        this.leaderboardList.innerHTML =
          '<li>No scores yet - be the first!</li>';
        return;
      }

      scores.slice(0, 10).forEach((score, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
                    <span>${index + 1}. ${score.name}</span>
                    <span>${score.score}</span>
                `;
        this.leaderboardList.appendChild(li);
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      this.leaderboardList.innerHTML = '<li>Failed to load leaderboard</li>';
    }
  }

  restartGame() {
    // Reset game state
    this.snake = [{ x: 10, y: 10 }];
    this.food = { x: 15, y: 15 };
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gameRunning = false;
    this.gameStarted = false;

    // Update UI
    this.scoreElement.textContent = this.score;
    this.gameOverElement.style.display = 'none';

    // Reset form visibility for next game
    this.playerNameInput.style.display = 'block';
    document.getElementById('submitScore').style.display = 'inline-block';

    // Remove success message if it exists
    const successMsg = document.querySelector('.success-message');
    if (successMsg) {
      successMsg.remove();
    }

    // Redraw initial state
    this.draw();
  }

  showRandomFact() {
    const randomIndex = Math.floor(Math.random() * this.snakeFacts.length);
    this.currentFact = this.snakeFacts[randomIndex];
    this.factDisplayTime = Date.now();
  }

  drawFact() {
    if (!this.currentFact || Date.now() - this.factDisplayTime > 3000) {
      this.currentFact = '';
      return;
    }

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(10, 10, this.canvas.width - 20, 60);

    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px Courier New';
    this.ctx.textAlign = 'left';

    // Word wrap the fact text
    const words = this.currentFact.split(' ');
    let line = '';
    let y = 30;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > this.canvas.width - 40 && i > 0) {
        this.ctx.fillText(line, 20, y);
        line = words[i] + ' ';
        y += 16;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, 20, y);

    this.ctx.restore();
  }

  draw() {
    this.clearCanvas();
    this.drawFood();
    this.drawSnake();
    this.drawFact();
  }
}

// Start the game when page loads
window.addEventListener('load', () => {
  new SnakeGame();
});
