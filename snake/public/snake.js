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

      if (this.checkGameOver()) {
        this.endGame();
        return;
      }

      this.gameLoop();
    }, 150);
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
        this.gameOverElement.style.display = 'none';
        this.playerNameInput.value = '';
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

    // Redraw initial state
    this.draw();
  }

  draw() {
    this.clearCanvas();
    this.drawFood();
    this.drawSnake();
  }
}

// Start the game when page loads
window.addEventListener('load', () => {
  new SnakeGame();
});
