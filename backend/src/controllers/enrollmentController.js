import pool from "../config/db.js";

/**
 * ENROLL learner in a course
 */
export const enrollInCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID",
    });
  }

  try {
    const userId = req.user.id;

    // Verify that the user is actually a learner
    const userResult = await pool.query(
      `SELECT id, role, is_active
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const user = userResult.rows[0];

    if (user.role !== "LEARNER") {
      return res.status(403).json({
        error: "Only learners can enroll in courses.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: "Your account is inactive.",
      });
    }

    // Verify course exists
    const courseResult = await pool.query(
      `SELECT id, title
       FROM courses
       WHERE id = $1`,
      [courseId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found.",
      });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await pool.query(
      `SELECT id, status
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [userId, courseId],
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(409).json({
        error: "You are already enrolled in this course.",
        enrollment: existingEnrollment.rows[0],
      });
    }

    // Create enrollment
    const result = await pool.query(
      `INSERT INTO enrollments
        (user_id, course_id, status)
       VALUES ($1, $2, 'ACTIVE')
       RETURNING *`,
      [userId, courseId],
    );

    res.status(201).json({
      message: "Successfully enrolled in the course.",
      enrollment: result.rows[0],
    });
  } catch (err) {
    console.error("Error enrolling learner:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * GET courses enrolled by the authenticated learner
 */
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         enrollments.id AS enrollment_id,
         enrollments.enrolled_at,
         enrollments.status,
         enrollments.completed_at,

         courses.id AS course_id,
         courses.title,
         courses.description,
         courses.duration,
         courses.price,

         instructors.id AS instructor_id,
         instructors.firstname AS instructor_firstname,
         instructors.lastname AS instructor_lastname

       FROM enrollments

       JOIN courses
         ON courses.id = enrollments.course_id

       LEFT JOIN instructors
         ON instructors.id = courses.instructor_id

       WHERE enrollments.user_id = $1

       ORDER BY enrollments.enrolled_at DESC`,
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching learner courses:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * GET a course and its learning content
 * Only available to enrolled learners
 */
export const getMyCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID",
    });
  }

  try {
    const userId = req.user.id;

    // Check enrollment
    const enrollmentResult = await pool.query(
      `SELECT
         id,
         status,
         enrolled_at,
         completed_at
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [userId, courseId],
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    // Get course
    const courseResult = await pool.query(
      `SELECT
         courses.id,
         courses.title,
         courses.description,
         courses.duration,
         courses.price,

         instructors.id AS instructor_id,
         instructors.firstname AS instructor_firstname,
         instructors.lastname AS instructor_lastname

       FROM courses

       LEFT JOIN instructors
         ON instructors.id = courses.instructor_id

       WHERE courses.id = $1`,
      [courseId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found.",
      });
    }

    // Get chapters and subchapters
    const contentResult = await pool.query(
      `SELECT
         chapters.id AS chapter_id,
         chapters.title AS chapter_title,

         subchapters.id AS subchapter_id,
         subchapters.title AS subchapter_title,
         subchapters.content AS subchapter_content

       FROM chapters

       LEFT JOIN subchapters
         ON subchapters.chapter_id = chapters.id

       WHERE chapters.course_id = $1

       ORDER BY chapters.id, subchapters.id`,
      [courseId],
    );

    // Build nested structure
    const chapters = [];

    for (const row of contentResult.rows) {
      let chapter = chapters.find((item) => item.id === row.chapter_id);

      if (!chapter) {
        chapter = {
          id: row.chapter_id,
          title: row.chapter_title,
          subchapters: [],
        };

        chapters.push(chapter);
      }

      if (row.subchapter_id) {
        chapter.subchapters.push({
          id: row.subchapter_id,
          title: row.subchapter_title,
          content: row.subchapter_content,
        });
      }
    }

    res.json({
      enrollment: enrollmentResult.rows[0],
      course: {
        ...courseResult.rows[0],
        chapters,
      },
    });
  } catch (err) {
    console.error("Error fetching learner course:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * Mark a subchapter as completed
 */
export const completeSubchapter = async (req, res) => {
  const subchapterId = parseInt(req.params.subchapterId, 10);

  if (!Number.isInteger(subchapterId)) {
    return res.status(400).json({
      error: "Invalid subchapter ID",
    });
  }

  try {
    const userId = req.user.id;

    // Verify the subchapter exists and belongs to a course
    const subchapterResult = await pool.query(
      `SELECT
         subchapters.id,
         chapters.course_id
       FROM subchapters
       JOIN chapters
         ON chapters.id = subchapters.chapter_id
       WHERE subchapters.id = $1`,
      [subchapterId],
    );

    if (subchapterResult.rows.length === 0) {
      return res.status(404).json({
        error: "Subchapter not found.",
      });
    }

    const courseId = subchapterResult.rows[0].course_id;

    // Verify learner is enrolled in the course
    const enrollmentResult = await pool.query(
      `SELECT id, status
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [userId, courseId],
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    if (enrollmentResult.rows[0].status !== "ACTIVE") {
      return res.status(403).json({
        error: "Your enrollment is not active.",
      });
    }

    // Insert progress
    const result = await pool.query(
      `INSERT INTO subchapter_progress
        (user_id, subchapter_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, subchapter_id)
       DO NOTHING
       RETURNING *`,
      [userId, subchapterId],
    );

    // Already completed
    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "Subchapter already completed.",
      });
    }

    // Check whether the learner has completed all subchapters
    const progressResult = await pool.query(
      `SELECT
     COUNT(subchapters.id) AS total_subchapters,
     COUNT(subchapter_progress.id) AS completed_subchapters
   FROM subchapters
   JOIN chapters
     ON chapters.id = subchapters.chapter_id
   LEFT JOIN subchapter_progress
     ON subchapter_progress.subchapter_id = subchapters.id
     AND subchapter_progress.user_id = $1
   WHERE chapters.course_id = $2`,
      [userId, courseId],
    );

    const totalSubchapters = parseInt(
      progressResult.rows[0].total_subchapters,
      10,
    );

    const completedSubchapters = parseInt(
      progressResult.rows[0].completed_subchapters,
      10,
    );

    let courseCompleted = false;

    if (totalSubchapters > 0 && completedSubchapters === totalSubchapters) {
      await pool.query(
        `UPDATE enrollments
     SET status = 'COMPLETED',
         completed_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
       AND course_id = $2`,
        [userId, courseId],
      );

      courseCompleted = true;
    }

    res.status(201).json({
      message: "Subchapter marked as completed.",
      progress: result.rows[0],
      course_completed: courseCompleted,
    });
  } catch (err) {
    console.error("Error completing subchapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * Get learner progress for a course
 */
export const getCourseProgress = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID",
    });
  }

  try {
    const userId = req.user.id;

    // Verify enrollment
    const enrollmentResult = await pool.query(
      `SELECT id, status, enrolled_at, completed_at
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [userId, courseId],
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    // Get total subchapters
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM subchapters
       JOIN chapters
         ON chapters.id = subchapters.chapter_id
       WHERE chapters.course_id = $1`,
      [courseId],
    );

    // Get completed subchapters
    const completedResult = await pool.query(
      `SELECT
         subchapter_progress.id,
         subchapter_progress.subchapter_id,
         subchapter_progress.completed_at
       FROM subchapter_progress
       JOIN subchapters
         ON subchapters.id = subchapter_progress.subchapter_id
       JOIN chapters
         ON chapters.id = subchapters.chapter_id
       WHERE subchapter_progress.user_id = $1
         AND chapters.course_id = $2
       ORDER BY subchapter_progress.subchapter_id`,
      [userId, courseId],
    );

    const total = parseInt(totalResult.rows[0].total, 10);
    const completed = completedResult.rows.length;
    const remaining = total - completed;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      course_id: courseId,
      enrollment: enrollmentResult.rows[0],
      progress: {
        total_subchapters: total,
        completed_subchapters: completed,
        remaining_subchapters: remaining,
        percentage,
      },
      completed_subchapters: completedResult.rows,
    });
  } catch (err) {
    console.error("Error fetching course progress:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};
