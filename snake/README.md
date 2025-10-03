# 🐍 Snake Game

A classic Snake game with a global leaderboard built with HTML5 Canvas and Express.js.

## Features

- 🎮 Classic Snake gameplay with arrow key controls
- 🍎 Eat red food to grow and score points
- 💀 Game over screen with name entry
- 🏆 Global leaderboard with persistent storage
- 📱 Responsive design
- ⚡ Real-time score tracking

## How to Play

1. Use arrow keys to control the snake
2. Eat the red food to grow and score points
3. Avoid hitting the walls or your own tail
4. When you die, enter your name to save your score
5. Compete for the top spot on the global leaderboard!

## Scoring

- Each food eaten = 10 points
- Your high score is saved locally
- Global leaderboard shows top 10 players

## Technical Details

- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **Backend**: Express.js server
- **Storage**: JSON file for persistent leaderboard
- **Port**: 5174

## Files

- `public/index.html` - Game interface
- `public/snake.js` - Game logic and controls
- `server/app.js` - Express server and API
- `server/scores.json` - Leaderboard data (auto-created)

## API Endpoints

- `GET /api/scores` - Get leaderboard
- `POST /api/scores` - Submit new score

## Running the Game

```bash
npm install
npm start
```

Game will be available at `http://localhost:5174`

---

Created by Mentat AI for the Mentat Party! 🎉
