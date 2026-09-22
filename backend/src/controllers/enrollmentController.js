import pool from "../config/db.js";

/**
 * Calculate required learning time for a chapter
 *
 * Rule:
 * 200 words = 2 minutes = 120 seconds
 *
 * The calculation is based on the content of all subchapters
 * belonging to the chapter.
 */
const getChapterRequiredTime = async (chapterId) => {
  const result = await pool.query(
    `SELECT
       COALESCE(
         SUM(
           array_length(
             regexp_split_to_array(
               NULLIF(
                 trim(
                   regexp_replace(s.content, '<[^>]*>', ' ', 'g')
                 ),
                 ''
               ),
               '\\s+'
             ),
             1
           )
         ),
         0
       ) AS word_count
     FROM subchapters s
     WHERE s.chapter_id = $1`,
    [chapterId],
  );

  const wordCount = parseInt(result.rows[0].word_count, 10) || 0;

  return Math.ceil((wordCount / 200) * 120);
};

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

    const courseResult = await pool.query(
      `SELECT
        courses.id,
        courses.title,
        courses.description,
        courses.price,

        instructors.id AS instructor_id,
        instructors.firstname AS instructor_firstname,
        instructors.lastname AS instructor_lastname,

        tests.id AS test_id,
        tests.title AS test_title

      FROM courses

      LEFT JOIN instructors
        ON instructors.id = courses.instructor_id

      LEFT JOIN tests
        ON tests.course_id = courses.id

      WHERE courses.id = $1`,
      [courseId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found.",
      });
    }

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

    const result = await pool.query(
      `INSERT INTO subchapter_progress
        (user_id, subchapter_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, subchapter_id)
       DO NOTHING
       RETURNING *`,
      [userId, subchapterId],
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "Subchapter already completed.",
      });
    }

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

    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM subchapters
       JOIN chapters
         ON chapters.id = subchapters.chapter_id
       WHERE chapters.course_id = $1`,
      [courseId],
    );

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

/**
 * Record learning time for a chapter
 */
export const recordChapterLearningTime = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);
  const seconds = parseInt(req.body.seconds, 10);

  if (!Number.isInteger(chapterId)) {
    return res.status(400).json({
      error: "Invalid chapter ID",
    });
  }

  if (!Number.isInteger(seconds) || seconds <= 0) {
    return res.status(400).json({
      error: "Learning time must be a positive number of seconds.",
    });
  }

  try {
    const userId = req.user.id;

    // Verify chapter exists and get its course
    const chapterResult = await pool.query(
      `SELECT id, course_id
       FROM chapters
       WHERE id = $1`,
      [chapterId],
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({
        error: "Chapter not found.",
      });
    }

    const chapter = chapterResult.rows[0];

    // Calculate required learning time dynamically
    const requiredTime = await getChapterRequiredTime(chapterId);

    // Verify learner is enrolled in the course
    const enrollmentResult = await pool.query(
      `SELECT id, status
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [userId, chapter.course_id],
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

    // Add the newly recorded learning time
    const result = await pool.query(
      `INSERT INTO chapter_progress
        (user_id, chapter_id, learning_time_seconds)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, chapter_id)
       DO UPDATE SET
         learning_time_seconds =
           chapter_progress.learning_time_seconds + EXCLUDED.learning_time_seconds
       RETURNING *`,
      [userId, chapterId, seconds],
    );

    const progress = result.rows[0];

    // Reaching the required duration does NOT automatically complete
    // the chapter. The learner must click "Mark as completed".
    const canComplete =
      requiredTime > 0 && progress.learning_time_seconds >= requiredTime;

    res.status(200).json({
      message: "Chapter learning time recorded.",
      progress: {
        ...progress,
        completed: progress.completed_at !== null,
        can_complete: canComplete,
        required_time_seconds: requiredTime,
      },
    });
  } catch (err) {
    console.error("Error recording chapter learning time:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * Mark a chapter as completed
 */
export const completeChapter = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);

  if (!Number.isInteger(chapterId)) {
    return res.status(400).json({
      error: "Invalid chapter ID",
    });
  }

  try {
    const userId = req.user.id;

    // Get chapter and its course
    const chapterResult = await pool.query(
      `SELECT id, course_id
       FROM chapters
       WHERE id = $1`,
      [chapterId],
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({
        error: "Chapter not found.",
      });
    }

    const chapter = chapterResult.rows[0];

    // Calculate required learning time dynamically
    const requiredTime = await getChapterRequiredTime(chapterId);

    // Verify learner is enrolled in the course
    const enrollmentResult = await pool.query(
      `SELECT id, status
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [userId, chapter.course_id],
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    console.log("COMPLETE CHAPTER ENROLLMENT:", enrollmentResult.rows[0]);

    if (
      enrollmentResult.rows[0].status !== "ACTIVE" &&
      enrollmentResult.rows[0].status !== "COMPLETED"
    ) {
      return res.status(403).json({
        error: "Your enrollment is not active.",
      });
    }

    // Get current learning progress
    const progressResult = await pool.query(
      `SELECT *
       FROM chapter_progress
       WHERE user_id = $1
         AND chapter_id = $2`,
      [userId, chapterId],
    );

    if (progressResult.rows.length === 0) {
      return res.status(400).json({
        error: "No learning progress has been recorded for this chapter.",
      });
    }

    const progress = progressResult.rows[0];

    // Learner must have reached the required learning time
    if (requiredTime > 0 && progress.learning_time_seconds < requiredTime) {
      return res.status(400).json({
        error:
          "You must complete the required learning time before marking this chapter as completed.",
        required_time_seconds: requiredTime,
        learning_time_seconds: progress.learning_time_seconds,
      });
    }

    // Mark the chapter as completed
    const result = await pool.query(
      `UPDATE chapter_progress
       SET completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
       WHERE user_id = $1
         AND chapter_id = $2
       RETURNING *`,
      [userId, chapterId],
    );

    await pool.query(
      `INSERT INTO subchapter_progress (user_id, subchapter_id, completed_at)
          SELECT $1, id, CURRENT_TIMESTAMP
          FROM subchapters
          WHERE chapter_id = $2
          ON CONFLICT (user_id, subchapter_id)
          DO UPDATE SET completed_at = COALESCE(subchapter_progress.completed_at, CURRENT_TIMESTAMP)`,
      [userId, chapterId],
    );

    res.status(200).json({
      message: "Chapter marked as completed.",
      progress: {
        ...result.rows[0],
        completed: true,
      },
    });
  } catch (err) {
    console.error("Error completing chapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * Get learning progress for a chapter
 */
export const getChapterLearningProgress = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);

  if (!Number.isInteger(chapterId)) {
    return res.status(400).json({
      error: "Invalid chapter ID",
    });
  }

  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         cp.id,
         cp.user_id,
         cp.chapter_id,
         cp.learning_time_seconds,
         cp.completed_at
       FROM chapters c
       LEFT JOIN chapter_progress cp
         ON cp.chapter_id = c.id
        AND cp.user_id = $1
       WHERE c.id = $2`,
      [userId, chapterId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Chapter not found.",
      });
    }

    const row = result.rows[0];

    const requiredTime = await getChapterRequiredTime(chapterId);

    res.status(200).json({
      progress: {
        chapter_id: row.chapter_id,
        learning_time_seconds: row.learning_time_seconds || 0,
        required_time_seconds: requiredTime,
        completed: row.completed_at !== null,
        completed_at: row.completed_at,
      },
    });
  } catch (err) {
    console.error("Error getting chapter learning progress:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * Get learning progress for all chapters in a course
 */
export const getCourseChapterProgress = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID",
    });
  }

  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         c.id AS chapter_id,
         c.title AS chapter_title,
         COALESCE(cp.learning_time_seconds, 0) AS learning_time_seconds,
         cp.completed_at
       FROM chapters c
       LEFT JOIN chapter_progress cp
         ON cp.chapter_id = c.id
        AND cp.user_id = $1
       WHERE c.course_id = $2
       ORDER BY c.id`,
      [userId, courseId],
    );

    const chapters = [];

    for (const row of result.rows) {
      const requiredTime = await getChapterRequiredTime(row.chapter_id);

      chapters.push({
        chapter_id: row.chapter_id,
        chapter_title: row.chapter_title,
        required_time_seconds: requiredTime,
        learning_time_seconds: row.learning_time_seconds,
        completed: row.completed_at !== null,
        completed_at: row.completed_at,
      });
    }

    const totalChapters = chapters.length;
    const completedChapters = chapters.filter(
      (chapter) => chapter.completed,
    ).length;

    res.status(200).json({
      course_id: courseId,
      total_chapters: totalChapters,
      completed_chapters: completedChapters,
      all_completed: totalChapters > 0 && completedChapters === totalChapters,
      chapters,
    });
  } catch (err) {
    console.error("Error getting course chapter progress:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};
