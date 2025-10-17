// =====================
// Imports
// =====================
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// =====================
// Config
// =====================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// PostgreSQL Connection (Render deployment)
// =====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Render DATABASE_URL
  ssl: { rejectUnauthorized: false }          // Required for Render external Postgres
});

// =====================
// Middleware
// =====================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================
// Authentication Helpers
// =====================

// Attach user info to EJS templates (so <%= user %> works)
const checkAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = payload;
    req.user = payload;
  } catch (err) {
    res.locals.user = null;
    req.user = null;
  }
  next();
};
app.use(checkAuth);

// Protect routes (redirect if not logged in)
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.redirect('/login');
  }
};

// =====================
// Auth Routes
// =====================
app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.render('login', { error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.render('login', { error: 'Invalid password' });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        type: user.type,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true });
    res.redirect('/courses');
  } catch (err) {
    console.error(err.message);
    res.render('login', { error: 'Database error' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.redirect('/login');
});

// =====================
// Course Routes
// =====================

// View all courses
app.get('/courses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id ASC');
    res.render('courses', { user: req.user, courses: result.rows, error: null });
  } catch (err) {
    console.error(err.message);
    res.render('courses', { user: req.user, courses: [], error: 'Database error' });
  }
});

// Create course (Instructors only)
app.post('/courses', authenticateToken, async (req, res) => {
  if (req.user.type !== 'Instructor') return res.status(403).json({ error: 'Access denied: Instructors only' });

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

// View one course + lessons
app.get('/course/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    const course = courseResult.rows[0];
    if (!course) return res.status(404).render('404', { message: 'Course not found' });

    const lessonsResult = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY id ASC', [id]);
    const lessons = lessonsResult.rows;

    res.render('course', { user: req.user, course, lessons });
  } catch (err) {
    console.error(err.message);
    res.status(500).render('500', { message: 'Database error' });
  }
});

// Create a lesson (Instructors only)
app.post('/course/:courseId/lessons', authenticateToken, async (req, res) => {
  const { courseId } = req.params;
  const { title, content } = req.body;

  if (req.user.type !== 'Instructor') return res.status(403).render('403', { message: 'Access denied: Instructors only' });

  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) return res.status(404).render('404', { message: 'Course not found' });

    await pool.query('INSERT INTO lessons (course_id, title, content, created_at) VALUES ($1, $2, $3, NOW())', [courseId, title, content]);
    res.redirect(`/course/${courseId}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).render('500', { message: 'Database error' });
  }
});

// Update / Delete courses remain unchanged...
// =====================
// Home + 404
// =====================
app.get('/', (req, res) => res.render('index'));

app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found' }));

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
