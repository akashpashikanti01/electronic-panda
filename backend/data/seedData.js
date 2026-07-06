const { v4: uuidv4 } = require('uuid');

const DEMO_USERS = [
  {
    id: uuidv4(),
    username: 'alex_maker',
    password: 'password123',
    displayName: 'Alex Maker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    bio: 'Electronics enthusiast 🔧',
    college: 'IIT Delhi',
    branch: 'Electrical Engineering'
  },
  {
    id: uuidv4(),
    username: 'priya_robotics',
    password: 'password123',
    displayName: 'Priya Robotics',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    bio: 'Robotics & IoT lover 🤖',
    college: 'VIT Vellore',
    branch: 'Electronics'
  },
  {
    id: uuidv4(),
    username: 'dev_embedded',
    password: 'password123',
    displayName: 'Dev Embedded',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
    bio: 'Embedded systems developer 💻',
    college: 'NIT Trichy',
    branch: 'ECE'
  },
  {
    id: uuidv4(),
    username: 'sara_iot',
    password: 'password123',
    displayName: 'Sara IoT',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
    bio: 'Smart home builder 🏠',
    college: 'Bits Pilani',
    branch: 'Electronics & Instrumentation'
  },
  {
    id: uuidv4(),
    username: 'mike_pcb',
    password: 'password123',
    displayName: 'Mike PCB',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    bio: 'PCB design expert 🎯',
    college: 'College of Engineering Pune',
    branch: 'ETC'
  }
];

const seedDatabase = async (run, get, all) => {
  try {
    // Seed users
    for (const user of DEMO_USERS) {
      await run(
        'INSERT INTO users (id, username, password, displayName, profilePicture, bio, college, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.username, user.password, user.displayName, user.profilePicture, user.bio, user.college, user.branch]
      );
    }

    // Demo projects data
    const projects = [
      { title: 'Automatic Plant Watering', description: 'Smart watering using Arduino and soil moisture sensors', tags: ['Arduino', 'IoT', 'Sensors'] },
      { title: 'Smart Dustbin', description: 'Automatic lid with HC-SR04 ultrasonic sensor', tags: ['Arduino', 'Sensors', 'IoT'] },
      { title: 'Street Light Controller', description: 'Solar-powered with LDR sensor and ESP32', tags: ['ESP32', 'IoT', 'Solar'] },
      { title: 'Home Automation System', description: 'Control lights, fans, AC remotely with ESP32', tags: ['ESP32', 'Home Automation', 'IoT'] },
      { title: 'Weather Station', description: 'Real-time weather with DHT22, BMP180, ESP32', tags: ['ESP32', 'Sensors', 'Weather'] },
      { title: 'Line Follower Robot', description: 'IR sensor-based line following robot', tags: ['Robotics', 'Arduino', 'Sensors'] },
      { title: 'Smart Door Lock', description: 'Biometric fingerprint door lock system', tags: ['Arduino', 'Security', 'Biometric'] },
      { title: 'Fire Alarm System', description: 'Multi-sensor fire detection with GSM alert', tags: ['Arduino', 'Safety', 'IoT'] },
      { title: 'Solar Tracker', description: 'Dual-axis solar panel tracking system', tags: ['Arduino', 'Solar', 'Robotics'] },
      { title: 'Bluetooth Car', description: 'RC car controlled via Bluetooth HC-05', tags: ['Arduino', 'Robotics', 'Bluetooth'] },
      { title: 'Smart Irrigation', description: 'IoT-based irrigation with GSM monitoring', tags: ['ESP32', 'IoT', 'Agriculture'] },
      { title: 'Digital Notice Board', description: 'Scrolling LED display using MAX7219', tags: ['Arduino', 'Electronics', 'Display'] }
    ];

    const projectIds = [];
    for (let i = 0; i < projects.length; i++) {
      const projectId = uuidv4();
      const userId = DEMO_USERS[i % DEMO_USERS.length].id;
      const proj = projects[i];
      
      await run(
        'INSERT INTO projects (id, userId, title, description, images, video, tags, components, instructions, circuitDiagram, sourceCode, pdf) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [projectId, userId, proj.title, proj.description, JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=700']), 'https://media.w3.org/CC0/video/ForBiggerBlazes.mp4', JSON.stringify(proj.tags), JSON.stringify(['Arduino', 'Sensors', 'Power Supply']), JSON.stringify(['Connect sensor', 'Upload code', 'Test']), 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', '#include <Arduino.h>\nvoid setup() {}', 'https://example.com/guide.pdf']
      );
      projectIds.push(projectId);
    }

    // Seed reels
    for (const projectId of projectIds) {
      const project = await get('SELECT userId FROM projects WHERE id = ?', [projectId]);
      await run(
        'INSERT INTO reels (id, projectId, userId, video) VALUES (?, ?, ?, ?)',
        [uuidv4(), projectId, project.userId, 'https://media.w3.org/CC0/video/ForBiggerBlazes.mp4']
      );
    }

    // Seed likes
    for (let i = 0; i < projectIds.length; i++) {
      const projectId = projectIds[i];
      const numLikes = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numLikes; j++) {
        const userId = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].id;
        const project = await get('SELECT userId FROM projects WHERE id = ?', [projectId]);
        if (userId !== project.userId) {
          try {
            await run('INSERT INTO likes (id, userId, projectId) VALUES (?, ?, ?)', [uuidv4(), userId, projectId]);
          } catch (e) {}
        }
      }
    }

    // Seed comments
    const comments = ['This is amazing! 🔥', 'Great project! 👍', 'Really helpful', 'Exactly what I needed', 'Can you make a tutorial?', 'Brilliant!', 'Love this!', 'Need help'];
    for (let i = 0; i < projectIds.length; i++) {
      const projectId = projectIds[i];
      const numComments = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numComments; j++) {
        const userId = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].id;
        const text = comments[Math.floor(Math.random() * comments.length)];
        const project = await get('SELECT userId FROM projects WHERE id = ?', [projectId]);
        if (userId !== project.userId) {
          await run('INSERT INTO comments (id, userId, projectId, text) VALUES (?, ?, ?, ?)', [uuidv4(), userId, projectId, text]);
        }
      }
    }

    // Seed followers
    for (let i = 0; i < DEMO_USERS.length; i++) {
      for (let j = 0; j < DEMO_USERS.length; j++) {
        if (i !== j && Math.random() > 0.4) {
          try {
            await run('INSERT INTO followers (id, followerId, followingId) VALUES (?, ?, ?)', [uuidv4(), DEMO_USERS[i].id, DEMO_USERS[j].id]);
          } catch (e) {}
        }
      }
    }

    // Seed bookmarks
    for (let i = 0; i < projectIds.length; i++) {
      const projectId = projectIds[i];
      const numBookmarks = Math.floor(Math.random() * 2);
      for (let j = 0; j < numBookmarks; j++) {
        const userId = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)].id;
        const project = await get('SELECT userId FROM projects WHERE id = ?', [projectId]);
        if (userId !== project.userId) {
          try {
            await run('INSERT INTO bookmarks (id, userId, projectId) VALUES (?, ?, ?)', [uuidv4(), userId, projectId]);
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = { seedDatabase };
