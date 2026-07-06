const express = require('express');
const { run, get, all } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await get('SELECT id, username, displayName, profilePicture, bio, college, branch, createdAt FROM users WHERE id = ?', [req.params.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get followers count
    const followers = await get('SELECT COUNT(*) as count FROM followers WHERE followingId = ?', [req.params.userId]);
    // Get following count
    const following = await get('SELECT COUNT(*) as count FROM followers WHERE followerId = ?', [req.params.userId]);
    // Get projects count
    const projects = await get('SELECT COUNT(*) as count FROM projects WHERE userId = ?', [req.params.userId]);

    res.json({
      ...user,
      followersCount: followers.count,
      followingCount: following.count,
      projectsCount: projects.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's projects
router.get('/:userId/projects', async (req, res) => {
  try {
    const projects = await all('SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC', [req.params.userId]);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (protected)
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { displayName, bio, college, branch, profilePicture } = req.body;
    await run(
      'UPDATE users SET displayName = ?, bio = ?, college = ?, branch = ?, profilePicture = ? WHERE id = ?',
      [displayName, bio, college, branch, profilePicture, req.params.userId]
    );

    const user = await get('SELECT id, username, displayName, profilePicture, bio, college, branch FROM users WHERE id = ?', [req.params.userId]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
