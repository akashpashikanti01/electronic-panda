const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { seedDatabase } = require('./data/seedData');

const dbPath = path.join(__dirname, 'electronic_panda.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
});

db.configure('busyTimeout', 5000);

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initializeDatabase = async () => {
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        displayName TEXT NOT NULL,
        profilePicture TEXT,
        bio TEXT,
        college TEXT,
        branch TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        images TEXT,
        video TEXT,
        tags TEXT,
        components TEXT,
        instructions TEXT,
        circuitDiagram TEXT,
        sourceCode TEXT,
        pdf TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Reels table
    await run(`
      CREATE TABLE IF NOT EXISTS reels (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        userId TEXT NOT NULL,
        video TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Likes table
    await run(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        projectId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, projectId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (projectId) REFERENCES projects(id)
      )
    `);

    // Comments table
    await run(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        projectId TEXT NOT NULL,
        text TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (projectId) REFERENCES projects(id)
      )
    `);

    // Followers table
    await run(`
      CREATE TABLE IF NOT EXISTS followers (
        id TEXT PRIMARY KEY,
        followerId TEXT NOT NULL,
        followingId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(followerId, followingId),
        FOREIGN KEY (followerId) REFERENCES users(id),
        FOREIGN KEY (followingId) REFERENCES users(id)
      )
    `);

    // Bookmarks table
    await run(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        projectId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, projectId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (projectId) REFERENCES projects(id)
      )
    `);

    // Check if database is empty and seed
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('🌱 Seeding database with demo data...');
      await seedDatabase(run, get, all);
      console.log('✅ Database seeded successfully');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

module.exports = { db, run, get, all, initializeDatabase };
