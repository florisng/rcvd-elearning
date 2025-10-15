import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Routes
app.get('/login', (req, res) => {
    res.render('login', { error: null }); // always pass 'error'
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token; // using cookie named 'token'
  
  if (!token) {
    // Redirect to login page if not logged in
    return res.redirect('/login');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // attach user info to request
    next();
  } catch (err) {
    return res.redirect('/login'); // invalid token → redirect to login
  }
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.render('login', { error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.render('login', { error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Set token in HTTP-only cookie
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/courses');
  } catch (err) {
    console.error(err.message);
    res.render('login', { error: 'Database error' });
  }
});

// =====================
// CRUD Routes for Courses
// =====================

// Create a new course
app.post('/courses', async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courses (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Read all courses
app.get('/courses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Read a single course
app.get('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a course
app.put('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE courses SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a course
app.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', course: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
