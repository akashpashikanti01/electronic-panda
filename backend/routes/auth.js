const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get } = require('../database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const userId = uuidv4();
    await run(
      'INSERT INTO users (id, username, password, displayName) VALUES (?, ?, ?, ?)',
      [userId, username, password, displayName]
    );

    const token = generateToken(userId);
    const user = await get('SELECT id, username, displayName, profilePicture, bio, college, branch FROM users WHERE id = ?', [userId]);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = await get('SELECT id, username, displayName, profilePicture, bio, college, branch FROM users WHERE username = ? AND password = ?', [username, password]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await get('SELECT id, username, displayName, profilePicture, bio, college, branch FROM users WHERE id = ?', [decoded.userId]);

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
