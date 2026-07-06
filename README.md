# Electronic Panda 🐼⚡

A mobile-first social platform where students share Electronics, Electrical, Robotics, IoT, Embedded Systems, Arduino, ESP32, and STEM projects.

## Features

- **Home Feed**: Browse project posts with likes, comments, bookmarks
- **Reels**: Full-screen vertical reel experience with swipe gestures
- **Project Documentation**: Swipe right to view complete project details
- **Explore**: Search and discover projects by title, tags, or creator
- **Profiles**: User profiles with bio, college, followers, and project grid
- **Social**: Like, comment, follow, bookmark projects

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + SQLite
- **Database**: SQLite (file-based, editable)

## Setup

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on http://localhost:5000
Frontend runs on http://localhost:3000

## Demo Users

- `alex_maker` / `password123`
- `priya_robotics` / `password123`
- `dev_embedded` / `password123`
- `sara_iot` / `password123`
- `mike_pcb` / `password123`

## Database

All data is stored in SQLite (`electronic_panda.db`). Everything is editable.

Tables:
- users
- projects
- reels
- likes
- comments
- followers
- bookmarks
