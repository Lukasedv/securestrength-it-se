// Backend server with vulnerable SQL injection endpoint
// DO NOT USE IN PRODUCTION - This is for educational purposes only

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'workout_progress.db');
const db = new sqlite3.Database(dbPath);

// Create tables on startup
db.serialize(() => {
  // Create users table (for demonstration)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT
  )`);

  // Insert sample users for testing
  db.run(`INSERT OR IGNORE INTO users (id, username, password, email) VALUES 
    (1, 'admin', 'admin123', 'admin@securestrength.com'),
    (2, 'user1', 'password1', 'user1@example.com'),
    (3, 'testuser', 'secret', 'test@example.com')`);

  // Create workout_progress table
  db.run(`CREATE TABLE IF NOT EXISTS workout_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    workout_id TEXT,
    exercise_name TEXT,
    reps INTEGER,
    weight REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// VULNERABLE ENDPOINT - SQL Injection vulnerability
// Based on WebGoat SQL injection lessons 5a/5b pattern
app.post('/api/progress/log', (req, res) => {
  const { workoutId, exerciseName, reps, weight, notes } = req.body;
  
  // Hardcoded user_id for demo (normally would come from auth)
  const userId = 1;
  
  console.log('Received progress log request:', { workoutId, exerciseName, reps, weight, notes });
  
  // VULNERABLE SQL CONSTRUCTION - String concatenation (DO NOT USE IN PRODUCTION)
  // This follows the WebGoat pattern for SQL injection vulnerabilities
  const query = `INSERT INTO workout_progress (user_id, workout_id, exercise_name, reps, weight, notes) VALUES (${userId}, '${workoutId}', '${exerciseName}', ${reps}, ${weight}, '${notes}')`;
  
  console.log('Executing SQL query:', query);
  
  // Execute the vulnerable query
  db.run(query, function(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message,
        query: query // Expose query for educational purposes 
      });
    }
    
    console.log('Progress logged successfully with ID:', this.lastID);
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Workout progress logged successfully',
      executedQuery: query // Expose for educational purposes
    });
  });
});

// Get progress history
app.get('/api/progress/history', (req, res) => {
  const userId = 1; // Hardcoded for demo
  
  db.all(
    'SELECT * FROM workout_progress WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching progress:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ progress: rows });
    }
  );
});

// Debug endpoint to view database contents (for testing injection)
app.get('/api/debug/users', (req, res) => {
  db.all('SELECT id, username, email FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Debug endpoint for all progress
app.get('/api/debug/progress', (req, res) => {
  db.all('SELECT * FROM workout_progress ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ progress: rows });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🔓 VULNERABLE Backend server running on http://localhost:${PORT}`);
  console.log(`⚠️  WARNING: This server contains intentional SQL injection vulnerabilities for educational purposes`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🔍 Debug endpoints available at /api/debug/users and /api/debug/progress`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});