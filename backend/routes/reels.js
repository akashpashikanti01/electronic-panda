const express = require('express');
const { all, get } = require('../database');

const router = express.Router();

// Get all reels
router.get('/', async (req, res) => {
  try {
    const reels = await all(`
      SELECT r.*, p.title as projectTitle, p.description as projectDescription, p.tags, u.username, u.displayName, u.profilePicture
      FROM reels r
      JOIN projects p ON r.projectId = p.id
      JOIN users u ON r.userId = u.id
      ORDER BY r.updatedAt DESC
    `);

    // Add likes and comments counts
    const reelsWithCounts = await Promise.all(reels.map(async (reel) => {
      const likes = await get('SELECT COUNT(*) as count FROM likes WHERE projectId = ?', [reel.projectId]);
      const comments = await get('SELECT COUNT(*) as count FROM comments WHERE projectId = ?', [reel.projectId]);
      return {
        ...reel,
        likesCount: likes.count,
        commentsCount: comments.count
      };
    }));

    res.json(reelsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
