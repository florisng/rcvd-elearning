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
// PostgreSQL Connection
// =====================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
    res.locals.user = payload; // available in templates
    req.user = payload;        // available in routes
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

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.render('login', { error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.render('login', { error: 'Invalid password' });

    // Include firstname + type in JWT payload
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        type: user.type, // ✅ Make type available to EJS
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

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
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

// Create a new course (only for instructors)
app.post('/courses', authenticateToken, async (req, res) => {
  if (req.user.type !== 'Instructor') {
    return res.status(403).json({ error: 'Access denied: Instructors only' });
  }

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

// View one course page with lessons
app.get('/course/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Get the course
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    const course = courseResult.rows[0];

    if (!course) {
      return res.status(404).render('404', { message: 'Course not found' });
    }

    // Get all lessons for this course
    const lessonsResult = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY id ASC',
      [id]
    );
    const lessons = lessonsResult.rows;

    // Render EJS page
    res.render('course', { user: req.user, course, lessons });
  } catch (err) {
    console.error(err.message);
    res.status(500).render('500', { message: 'Database error' });
  }
});

// Create a new lesson for a course
app.post('/course/:courseId/lessons', authenticateToken, async (req, res) => {
  const { courseId } = req.params;
  const { title, content } = req.body;

  // Only instructors can create lessons
  if (req.user.type !== 'Instructor') {
    return res.status(403).render('403', { message: 'Access denied: Instructors only' });
  }

  try {
    // Check if course exists
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Course not found' });
    }

    // Insert the lesson
    const result = await pool.query(
      'INSERT INTO lessons (course_id, title, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [courseId, title, content]
    );

    // Redirect back to the course page
    res.redirect(`/course/${courseId}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).render('500', { message: 'Database error' });
  }
});


// Update course
app.put('/courses/:id', authenticateToken, async (req, res) => {
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

// Delete course
app.delete('/courses/:id', authenticateToken, async (req, res) => {
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

// =====================
// Home + 404
// =====================
app.get('/', (req, res) => res.render('index'));

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
