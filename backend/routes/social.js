const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Like/Unlike project
router.post('/like/:projectId', authMiddleware, async (req, res) => {
  try {
    const existingLike = await get('SELECT id FROM likes WHERE userId = ? AND projectId = ?', [req.userId, req.params.projectId]);

    if (existingLike) {
      await run('DELETE FROM likes WHERE id = ?', [existingLike.id]);
      res.json({ liked: false });
    } else {
      const likeId = uuidv4();
      await run(
        'INSERT INTO likes (id, userId, projectId) VALUES (?, ?, ?)',
        [likeId, req.userId, req.params.projectId]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if liked
router.get('/like/:projectId', authMiddleware, async (req, res) => {
  try {
    const like = await get('SELECT id FROM likes WHERE userId = ? AND projectId = ?', [req.userId, req.params.projectId]);
    res.json({ liked: !!like });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookmark/Unbookmark project
router.post('/bookmark/:projectId', authMiddleware, async (req, res) => {
  try {
    const existingBookmark = await get('SELECT id FROM bookmarks WHERE userId = ? AND projectId = ?', [req.userId, req.params.projectId]);

    if (existingBookmark) {
      await run('DELETE FROM bookmarks WHERE id = ?', [existingBookmark.id]);
      res.json({ bookmarked: false });
    } else {
      const bookmarkId = uuidv4();
      await run(
        'INSERT INTO bookmarks (id, userId, projectId) VALUES (?, ?, ?)',
        [bookmarkId, req.userId, req.params.projectId]
      );
      res.json({ bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if bookmarked
router.get('/bookmark/:projectId', authMiddleware, async (req, res) => {
  try {
    const bookmark = await get('SELECT id FROM bookmarks WHERE userId = ? AND projectId = ?', [req.userId, req.params.projectId]);
    res.json({ bookmarked: !!bookmark });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId === req.params.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await get('SELECT id FROM followers WHERE followerId = ? AND followingId = ?', [req.userId, req.params.userId]);

    if (existingFollow) {
      await run('DELETE FROM followers WHERE id = ?', [existingFollow.id]);
      res.json({ following: false });
    } else {
      const followId = uuidv4();
      await run(
        'INSERT INTO followers (id, followerId, followingId) VALUES (?, ?, ?)',
        [followId, req.userId, req.params.userId]
      );
      res.json({ following: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if following
router.get('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const follow = await get('SELECT id FROM followers WHERE followerId = ? AND followingId = ?', [req.userId, req.params.userId]);
    res.json({ following: !!follow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
