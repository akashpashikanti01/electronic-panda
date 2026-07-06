const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await all(`
      SELECT p.*, u.username, u.displayName, u.profilePicture FROM projects p
      JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
    `);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const project = await get(`
      SELECT p.*, u.username, u.displayName, u.profilePicture, u.bio, u.college, u.branch FROM projects p
      JOIN users u ON p.userId = u.id
      WHERE p.id = ?
    `, [req.params.projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Get likes count
    const likes = await get('SELECT COUNT(*) as count FROM likes WHERE projectId = ?', [req.params.projectId]);
    // Get comments
    const comments = await all(`
      SELECT c.*, u.username, u.displayName, u.profilePicture FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.projectId = ?
      ORDER BY c.createdAt DESC
    `, [req.params.projectId]);

    res.json({
      ...project,
      likesCount: likes.count,
      comments: comments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const projectId = uuidv4();
    const { title, description, images, video, tags, components, instructions, circuitDiagram, sourceCode, pdf } = req.body;

    await run(`
      INSERT INTO projects (id, userId, title, description, images, video, tags, components, instructions, circuitDiagram, sourceCode, pdf)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [projectId, req.userId, title, description, images || '', video || '', tags || '', components || '', instructions || '', circuitDiagram || '', sourceCode || '', pdf || '']);

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project (protected)
router.put('/:projectId', authMiddleware, async (req, res) => {
  try {
    const project = await get('SELECT userId FROM projects WHERE id = ?', [req.params.projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const { title, description, images, video, tags, components, instructions, circuitDiagram, sourceCode, pdf } = req.body;

    await run(`
      UPDATE projects SET title = ?, description = ?, images = ?, video = ?, tags = ?, components = ?, instructions = ?, circuitDiagram = ?, sourceCode = ?, pdf = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, images, video, tags, components, instructions, circuitDiagram, sourceCode, pdf, req.params.projectId]);

    const updated = await get('SELECT * FROM projects WHERE id = ?', [req.params.projectId]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project (protected)
router.delete('/:projectId', authMiddleware, async (req, res) => {
  try {
    const project = await get('SELECT userId FROM projects WHERE id = ?', [req.params.projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.userId !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    await run('DELETE FROM likes WHERE projectId = ?', [req.params.projectId]);
    await run('DELETE FROM comments WHERE projectId = ?', [req.params.projectId]);
    await run('DELETE FROM bookmarks WHERE projectId = ?', [req.params.projectId]);
    await run('DELETE FROM reels WHERE projectId = ?', [req.params.projectId]);
    await run('DELETE FROM projects WHERE id = ?', [req.params.projectId]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search projects
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const projects = await all(`
      SELECT p.*, u.username, u.displayName, u.profilePicture FROM projects p
      JOIN users u ON p.userId = u.id
      WHERE p.title LIKE ? OR p.tags LIKE ? OR u.username LIKE ? OR u.displayName LIKE ?
      ORDER BY p.createdAt DESC
    `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
