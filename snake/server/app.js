const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5174;
const SCORES_FILE = path.join(__dirname, 'scores.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ensure scores file exists
if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// Helper functions
const getScores = () => {
  try {
    const data = fs.readFileSync(SCORES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scores:', error);
    return [];
  }
};

const saveScores = (scores) => {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
  } catch (error) {
    console.error('Error saving scores:', error);
    throw error;
  }
};

// API Routes
app.get('/api/scores', (req, res) => {
  console.log('GET /api/scores - Fetching leaderboard');
  const scores = getScores();

  // Sort by score (highest first) and limit to top 50
  const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 50);

  console.log(`GET /api/scores - Returning ${sortedScores.length} scores`);
  res.json(sortedScores);
});

app.get('/api/scores/:username', (req, res) => {
  console.log(
    `GET /api/scores/${req.params.username} - Fetching user high score`
  );
  const scores = getScores();

  // Find all scores for this username and get the highest
  const userScores = scores.filter(
    (score) => score.name.toLowerCase() === req.params.username.toLowerCase()
  );

  if (userScores.length === 0) {
    console.log(`GET /api/scores/${req.params.username} - No scores found`);
    return res.json({ username: req.params.username, highScore: null });
  }

  const highScore = Math.max(...userScores.map((score) => score.score));
  console.log(
    `GET /api/scores/${req.params.username} - High score: ${highScore}`
  );

  res.json({ username: req.params.username, highScore });
});

app.post('/api/scores', (req, res) => {
  console.log('POST /api/scores - Received score submission');
  console.log('Request body:', req.body);

  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    console.log('POST /api/scores - Invalid data');
    return res.status(400).json({ error: 'Name and score are required' });
  }

  if (name.length > 20) {
    console.log('POST /api/scores - Name too long');
    return res
      .status(400)
      .json({ error: 'Name must be 20 characters or less' });
  }

  if (score < 0) {
    console.log('POST /api/scores - Invalid score');
    return res.status(400).json({ error: 'Score must be non-negative' });
  }

  const newScore = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    name: name.trim(),
    score: score,
    timestamp: new Date().toISOString(),
  };

  console.log('POST /api/scores - Created new score entry:', newScore);

  try {
    const scores = getScores();
    scores.push(newScore);

    // Keep only the top 100 scores to prevent file from growing too large
    const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 100);

    saveScores(sortedScores);

    console.log('POST /api/scores - Score saved successfully');
    res.json(newScore);
  } catch (error) {
    console.error('POST /api/scores - Failed to save score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Serve the game
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🐍 Snake Game Server running on http://localhost:${PORT}`);
  console.log(`Scores file: ${SCORES_FILE}`);
});

module.exports = app;
