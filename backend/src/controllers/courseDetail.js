// src/controllers/coursesController.js
import pool from '../config/db.js';

// Get course by id with chapters and subchapters
export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch course info
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const course = courseResult.rows[0];

    // Fetch chapters for this course
    const chaptersResult = await pool.query(
      'SELECT * FROM chapters WHERE course_id = $1 ORDER BY id',
      [id]
    );
    const chapters = chaptersResult.rows;

    // Fetch subchapters for each chapter
    for (let chapter of chapters) {
      const subResult = await pool.query(
        'SELECT * FROM subchapters WHERE chapter_id = $1 ORDER BY id',
        [chapter.id]
      );
      chapter.subchapters = subResult.rows;
    }

    course.chapters = chapters;

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
