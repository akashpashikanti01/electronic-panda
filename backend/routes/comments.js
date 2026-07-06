const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get comments for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const comments = await all(`
      SELECT c.*, u.username, u.displayName, u.profilePicture FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.projectId = ?
      ORDER BY c.createdAt DESC
    `, [req.params.projectId]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, text } = req.body;
    if (!projectId || !text) return res.status(400).json({ error: 'Missing fields' });

    const commentId = uuidv4();
    await run(
      'INSERT INTO comments (id, userId, projectId, text) VALUES (?, ?, ?, ?)',
      [commentId, req.userId, projectId, text]
    );

    const comment = await get(`
      SELECT c.*, u.username, u.displayName, u.profilePicture FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.id = ?
    `, [commentId]);

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment (protected)
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await get('SELECT userId FROM comments WHERE id = ?', [req.params.commentId]);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    await run('DELETE FROM comments WHERE id = ?', [req.params.commentId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
