import pool from "../config/db.js";

/**
 * Create a test for an instructor's course
 */
export const createTest = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  const {
    title,
    pass_percentage = 80,
    duration_minutes = 30,
    questions_per_attempt = 20,
    max_attempts = 3,
  } = req.body;

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID.",
    });
  }

  if (!title?.trim()) {
    return res.status(400).json({
      error: "Test title is required.",
    });
  }

  try {
    const instructorResult = await pool.query(
      `SELECT id
       FROM instructors
       WHERE user_id = $1`,
      [req.user.id],
    );

    if (instructorResult.rows.length === 0) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const instructorId = instructorResult.rows[0].id;

    const courseResult = await pool.query(
      `SELECT id
       FROM courses
       WHERE id = $1
         AND instructor_id = $2`,
      [courseId, instructorId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to modify it.",
      });
    }

    if (
      !Number.isInteger(Number(pass_percentage)) ||
      Number(pass_percentage) < 1 ||
      Number(pass_percentage) > 100
    ) {
      return res.status(400).json({
        error: "Pass percentage must be between 1 and 100.",
      });
    }

    if (
      !Number.isInteger(Number(duration_minutes)) ||
      Number(duration_minutes) < 1
    ) {
      return res.status(400).json({
        error: "Duration must be at least 1 minute.",
      });
    }

    if (
      !Number.isInteger(Number(questions_per_attempt)) ||
      Number(questions_per_attempt) < 1
    ) {
      return res.status(400).json({
        error: "Questions per attempt must be at least 1.",
      });
    }

    if (!Number.isInteger(Number(max_attempts)) || Number(max_attempts) < 1) {
      return res.status(400).json({
        error: "Maximum attempts must be at least 1.",
      });
    }

    const existingTest = await pool.query(
      `SELECT id
       FROM tests
       WHERE course_id = $1`,
      [courseId],
    );

    if (existingTest.rows.length > 0) {
      return res.status(409).json({
        error: "This course already has a test.",
      });
    }

    const result = await pool.query(
      `INSERT INTO tests (
        course_id,
        title,
        pass_percentage,
        duration_minutes,
        questions_per_attempt,
        max_attempts
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        courseId,
        title.trim(),
        Number(pass_percentage),
        Number(duration_minutes),
        Number(questions_per_attempt),
        Number(max_attempts),
      ],
    );

    res.status(201).json({
      message: "Test created successfully.",
      test: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating test:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Create a question with multiple-choice options
 */
export const createQuestion = async (req, res) => {
  const testId = parseInt(req.params.testId, 10);

  const { question_text, options } = req.body;

  if (!Number.isInteger(testId)) {
    return res.status(400).json({
      error: "Invalid test ID.",
    });
  }

  if (!question_text?.trim()) {
    return res.status(400).json({
      error: "Question text is required.",
    });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      error: "At least two options are required.",
    });
  }

  const correctOptions = options.filter((option) => option.is_correct === true);

  if (correctOptions.length !== 1) {
    return res.status(400).json({
      error: "Exactly one option must be marked as correct.",
    });
  }

  for (const option of options) {
    if (!option.text?.trim()) {
      return res.status(400).json({
        error: "Every option must have text.",
      });
    }
  }

  try {
    const instructorResult = await pool.query(
      `SELECT id
       FROM instructors
       WHERE user_id = $1`,
      [req.user.id],
    );

    if (instructorResult.rows.length === 0) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const instructorId = instructorResult.rows[0].id;

    const testResult = await pool.query(
      `SELECT tests.id
       FROM tests
       JOIN courses
         ON courses.id = tests.course_id
       WHERE tests.id = $1
         AND courses.instructor_id = $2`,
      [testId, instructorId],
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test not found or you are not authorized to modify it.",
      });
    }

    await pool.query("BEGIN");

    try {
      const questionResult = await pool.query(
        `INSERT INTO test_questions (
          test_id,
          question_text
        )
        VALUES ($1, $2)
        RETURNING *`,
        [testId, question_text.trim()],
      );

      const question = questionResult.rows[0];

      const createdOptions = [];

      for (const option of options) {
        const optionResult = await pool.query(
          `INSERT INTO question_options (
            question_id,
            option_text,
            is_correct
          )
          VALUES ($1, $2, $3)
          RETURNING id, question_id, option_text`,
          [question.id, option.text.trim(), option.is_correct === true],
        );

        createdOptions.push(optionResult.rows[0]);
      }

      await pool.query("COMMIT");

      res.status(201).json({
        message: "Question created successfully.",
        question: {
          ...question,
          options: createdOptions,
        },
      });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error creating question:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Get questions for an instructor's test
 */
export const getQuestions = async (req, res) => {
  const testId = parseInt(req.params.testId, 10);

  if (!Number.isInteger(testId)) {
    return res.status(400).json({
      error: "Invalid test ID.",
    });
  }

  try {
    const instructorResult = await pool.query(
      `SELECT id
       FROM instructors
       WHERE user_id = $1`,
      [req.user.id],
    );

    if (instructorResult.rows.length === 0) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const instructorId = instructorResult.rows[0].id;

    const testResult = await pool.query(
      `SELECT tests.id, tests.title
       FROM tests
       JOIN courses
         ON courses.id = tests.course_id
       WHERE tests.id = $1
         AND courses.instructor_id = $2`,
      [testId, instructorId],
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test not found or you are not authorized to access it.",
      });
    }

    const result = await pool.query(
      `SELECT
         tq.id AS question_id,
         tq.question_text,
         tq.created_at,
         qo.id AS option_id,
         qo.option_text
       FROM test_questions tq
       LEFT JOIN question_options qo
         ON qo.question_id = tq.id
       WHERE tq.test_id = $1
       ORDER BY tq.id ASC, qo.id ASC`,
      [testId],
    );

    const questionsMap = new Map();

    for (const row of result.rows) {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          id: row.question_id,
          question_text: row.question_text,
          created_at: row.created_at,
          options: [],
        });
      }

      if (row.option_id) {
        questionsMap.get(row.question_id).options.push({
          id: row.option_id,
          option_text: row.option_text,
        });
      }
    }

    res.json({
      test: testResult.rows[0],
      questions: Array.from(questionsMap.values()),
    });
  } catch (err) {
    console.error("Error fetching test questions:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Update a test question
 */
export const updateQuestion = async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  const { question_text, options } = req.body;

  if (!Number.isInteger(questionId)) {
    return res.status(400).json({
      error: "Invalid question ID.",
    });
  }

  if (!question_text?.trim()) {
    return res.status(400).json({
      error: "Question text is required.",
    });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      error: "At least two options are required.",
    });
  }

  const correctOptions = options.filter((option) => option.is_correct === true);

  if (correctOptions.length !== 1) {
    return res.status(400).json({
      error: "Exactly one option must be marked as correct.",
    });
  }

  for (const option of options) {
    if (!option.text?.trim()) {
      return res.status(400).json({
        error: "Every option must have text.",
      });
    }
  }

  try {
    const instructorResult = await pool.query(
      `SELECT id
       FROM instructors
       WHERE user_id = $1`,
      [req.user.id],
    );

    if (instructorResult.rows.length === 0) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const instructorId = instructorResult.rows[0].id;

    const questionResult = await pool.query(
      `SELECT tq.id
       FROM test_questions tq
       JOIN tests t
         ON t.id = tq.test_id
       JOIN courses c
         ON c.id = t.course_id
       WHERE tq.id = $1
         AND c.instructor_id = $2`,
      [questionId, instructorId],
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Question not found or you are not authorized to modify it.",
      });
    }

    await pool.query("BEGIN");

    try {
      await pool.query(
        `UPDATE test_questions
         SET question_text = $1
         WHERE id = $2`,
        [question_text.trim(), questionId],
      );

      await pool.query(
        `DELETE FROM question_options
         WHERE question_id = $1`,
        [questionId],
      );

      const updatedOptions = [];

      for (const option of options) {
        const optionResult = await pool.query(
          `INSERT INTO question_options (
            question_id,
            option_text,
            is_correct
          )
          VALUES ($1, $2, $3)
          RETURNING id, question_id, option_text`,
          [questionId, option.text.trim(), option.is_correct === true],
        );

        updatedOptions.push(optionResult.rows[0]);
      }

      await pool.query("COMMIT");

      res.json({
        message: "Question updated successfully.",
        question: {
          id: questionId,
          question_text: question_text.trim(),
          options: updatedOptions,
        },
      });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error updating question:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Delete a test question
 */
export const deleteQuestion = async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  if (!Number.isInteger(questionId)) {
    return res.status(400).json({
      error: "Invalid question ID.",
    });
  }

  try {
    const instructorResult = await pool.query(
      `SELECT id
       FROM instructors
       WHERE user_id = $1`,
      [req.user.id],
    );

    if (instructorResult.rows.length === 0) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const instructorId = instructorResult.rows[0].id;

    const result = await pool.query(
      `DELETE FROM test_questions tq
       USING tests t, courses c
       WHERE tq.id = $1
         AND tq.test_id = t.id
         AND t.course_id = c.id
         AND c.instructor_id = $2
       RETURNING tq.id`,
      [questionId, instructorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Question not found or you are not authorized to delete it.",
      });
    }

    res.json({
      message: "Question deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting question:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Start a test attempt for a learner
 */
export const startTest = async (req, res) => {
  const testId = parseInt(req.params.testId, 10);

  if (!Number.isInteger(testId)) {
    return res.status(400).json({
      error: "Invalid test ID.",
    });
  }

  try {
    const testResult = await pool.query(
      `SELECT
         id,
         course_id,
         title,
         pass_percentage,
         duration_minutes,
         questions_per_attempt,
         max_attempts
       FROM tests
       WHERE id = $1`,
      [testId],
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test not found.",
      });
    }

    const test = testResult.rows[0];

    const enrollmentResult = await pool.query(
      `SELECT id, status
       FROM enrollments
       WHERE user_id = $1
         AND course_id = $2`,
      [req.user.id, test.course_id],
    );

    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    const enrollment = enrollmentResult.rows[0];

    if (enrollment.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Your enrollment is not active.",
      });
    }

    const progressResult = await pool.query(
      `SELECT
         COUNT(s.id)::integer AS total_subchapters,
         COUNT(sp.id)::integer AS completed_subchapters
       FROM subchapters s
       JOIN chapters c
         ON c.id = s.chapter_id
       LEFT JOIN subchapter_progress sp
         ON sp.subchapter_id = s.id
        AND sp.user_id = $1
       WHERE c.course_id = $2`,
      [req.user.id, test.course_id],
    );

    const progress = progressResult.rows[0];

    const totalSubchapters = Number(progress.total_subchapters);
    const completedSubchapters = Number(progress.completed_subchapters);

    if (totalSubchapters === 0 || completedSubchapters < totalSubchapters) {
      return res.status(403).json({
        error: "You must complete all course content before taking the test.",
      });
    }

    const attemptsResult = await pool.query(
      `SELECT
         COUNT(*)::integer AS attempt_count
       FROM test_attempts
       WHERE test_id = $1
         AND user_id = $2`,
      [testId, req.user.id],
    );

    const attemptCount = Number(attemptsResult.rows[0].attempt_count);

    if (attemptCount >= test.max_attempts) {
      return res.status(403).json({
        error: "You have reached the maximum number of attempts.",
      });
    }

    const questionCountResult = await pool.query(
      `SELECT COUNT(*)::integer AS count
       FROM test_questions
       WHERE test_id = $1`,
      [testId],
    );

    const questionCount = Number(questionCountResult.rows[0].count);

    if (questionCount < test.questions_per_attempt) {
      return res.status(400).json({
        error: `This test does not have enough questions. Required: ${test.questions_per_attempt}, available: ${questionCount}.`,
      });
    }

    const attemptNumber = attemptCount + 1;

    const attemptResult = await pool.query(
      `INSERT INTO test_attempts (
        test_id,
        user_id,
        attempt_number,
        started_at,
        expires_at,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        NOW(),
        NOW() + ($4 * INTERVAL '1 minute'),
        'IN_PROGRESS'
      )
      RETURNING
        id,
        test_id,
        user_id,
        attempt_number,
        started_at,
        expires_at,
        status`,
      [testId, req.user.id, attemptNumber, Number(test.duration_minutes)],
    );

    const attempt = attemptResult.rows[0];

    const questionsResult = await pool.query(
      `SELECT id
       FROM test_questions
       WHERE test_id = $1
       ORDER BY RANDOM()
       LIMIT $2`,
      [testId, test.questions_per_attempt],
    );

    for (let i = 0; i < questionsResult.rows.length; i++) {
      await pool.query(
        `INSERT INTO attempt_questions (
          attempt_id,
          question_id,
          question_order
        )
        VALUES ($1, $2, $3)`,
        [attempt.id, questionsResult.rows[i].id, i + 1],
      );
    }

    const selectedQuestionsResult = await pool.query(
      `SELECT
         aq.question_order,
         tq.id AS question_id,
         tq.question_text,
         qo.id AS option_id,
         qo.option_text
       FROM attempt_questions aq
       JOIN test_questions tq
         ON tq.id = aq.question_id
       JOIN question_options qo
         ON qo.question_id = tq.id
       WHERE aq.attempt_id = $1
       ORDER BY aq.question_order ASC, qo.id ASC`,
      [attempt.id],
    );

    const questionsMap = new Map();

    for (const row of selectedQuestionsResult.rows) {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          question_id: row.question_id,
          question_order: row.question_order,
          question_text: row.question_text,
          options: [],
        });
      }

      questionsMap.get(row.question_id).options.push({
        option_id: row.option_id,
        option_text: row.option_text,
      });
    }

    res.status(201).json({
      message: "Test started successfully.",
      attempt: {
        id: attempt.id,
        attempt_number: attempt.attempt_number,
        started_at: attempt.started_at,
        expires_at: attempt.expires_at,
        status: attempt.status,
      },
      test: {
        id: test.id,
        title: test.title,
        duration_minutes: test.duration_minutes,
        questions_per_attempt: test.questions_per_attempt,
        pass_percentage: test.pass_percentage,
      },
      questions: Array.from(questionsMap.values()),
    });
  } catch (err) {
    console.error("Error starting test:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Submit a test attempt
 */
export const submitTest = async (req, res) => {
  const attemptId = parseInt(req.params.attemptId, 10);

  if (!Number.isInteger(attemptId)) {
    return res.status(400).json({
      error: "Invalid attempt ID.",
    });
  }

  try {
    // 1. Get the attempt
    const attemptResult = await pool.query(
      `SELECT
         ta.id,
         ta.test_id,
         ta.user_id,
         ta.status,
         ta.started_at,
         ta.expires_at,
         t.pass_percentage,
         t.questions_per_attempt
       FROM test_attempts ta
       JOIN tests t
         ON t.id = ta.test_id
       WHERE ta.id = $1
         AND ta.user_id = $2`,
      [attemptId, req.user.id],
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test attempt not found.",
      });
    }

    const attempt = attemptResult.rows[0];

    // 2. Make sure the attempt is still in progress
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({
        error: "This test attempt has already been submitted.",
      });
    }

    // 3. Check expiration
    const expirationResult = await pool.query(
      `SELECT NOW() > expires_at AS expired
       FROM test_attempts
       WHERE id = $1`,
      [attemptId],
    );

    if (expirationResult.rows[0].expired) {
      await pool.query(
        `UPDATE test_attempts
         SET
           status = 'EXPIRED',
           actual_duration = expires_at - started_at
         WHERE id = $1`,
        [attemptId],
      );

      return res.status(400).json({
        error: "This test attempt has expired.",
      });
    }

    // 4. Get the questions assigned to this attempt
    const questionsResult = await pool.query(
      `SELECT
         aq.question_id
       FROM attempt_questions aq
       WHERE aq.attempt_id = $1
       ORDER BY aq.question_order ASC`,
      [attemptId],
    );

    const questions = questionsResult.rows;

    if (questions.length === 0) {
      return res.status(400).json({
        error: "No questions were assigned to this attempt.",
      });
    }

    const totalQuestions = questions.length;

    // 5. Get answers already saved by saveAnswer()
    const answersResult = await pool.query(
      `SELECT
         aa.question_id,
         aa.option_id,
         qo.is_correct
       FROM attempt_answers aa
       JOIN question_options qo
         ON qo.id = aa.option_id
        AND qo.question_id = aa.question_id
       WHERE aa.attempt_id = $1`,
      [attemptId],
    );

    const answers = answersResult.rows;

    // 6. Calculate score
    const answeredQuestions = answers.length;

    const correctAnswers = answers.filter(
      (answer) => answer.is_correct === true,
    ).length;

    const incorrectAnswers = answeredQuestions - correctAnswers;

    // Unanswered questions are included in the total
    // but are not counted as correct.
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const passed = percentage >= Number(attempt.pass_percentage);

    // 7. Calculate actual duration
    const actualDurationResult = await pool.query(
      `SELECT
         NOW() - started_at AS duration
       FROM test_attempts
       WHERE id = $1`,
      [attemptId],
    );

    const actualDuration = actualDurationResult.rows[0].duration;

    // 8. Complete the attempt
    const completionResult = await pool.query(
      `UPDATE test_attempts
       SET
         status = 'COMPLETED',
         submitted_at = NOW(),
         score = $2,
         passed = $3,
         actual_duration = $4
       WHERE id = $1
       RETURNING
         id,
         status,
         submitted_at,
         score,
         passed,
         actual_duration`,
      [attemptId, Math.round(percentage), passed, actualDuration],
    );

    const completedAttempt = completionResult.rows[0];

    // 9. Return result
    return res.json({
      message: "Test submitted successfully.",
      result: {
        attempt_id: attemptId,
        total_questions: totalQuestions,
        answered_questions: answeredQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        unanswered_questions: totalQuestions - answeredQuestions,
        percentage: Number(percentage.toFixed(2)),
        pass_percentage: Number(attempt.pass_percentage),
        passed,
        status: completedAttempt.status,
        submitted_at: completedAttempt.submitted_at,
        score: completedAttempt.score,
        actual_duration: completedAttempt.actual_duration,
      },
    });
  } catch (err) {
    console.error("Error submitting test:", err);

    return res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Get learner's attempts for a test
 */
export const getTestAttempts = async (req, res) => {
  const testId = parseInt(req.params.testId, 10);

  if (!Number.isInteger(testId)) {
    return res.status(400).json({
      error: "Invalid test ID.",
    });
  }

  try {
    const testResult = await pool.query(
      `SELECT id, title, max_attempts
       FROM tests
       WHERE id = $1`,
      [testId],
    );

    if (testResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test not found.",
      });
    }

    const attemptsResult = await pool.query(
      `SELECT
         id,
         attempt_number,
         status,
         score,
         passed,
         started_at,
         submitted_at,
         actual_duration
       FROM test_attempts
       WHERE test_id = $1
         AND user_id = $2
       ORDER BY attempt_number ASC`,
      [testId, req.user.id],
    );

    res.json({
      test: testResult.rows[0],
      attempts: attemptsResult.rows,
    });
  } catch (err) {
    console.error("Error fetching test attempts:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Resume an existing test attempt
 */
export const resumeTest = async (req, res) => {
  const attemptId = parseInt(req.params.attemptId, 10);

  if (!Number.isInteger(attemptId)) {
    return res.status(400).json({
      error: "Invalid attempt ID.",
    });
  }

  try {
    const attemptResult = await pool.query(
      `SELECT
         ta.id,
         ta.test_id,
         ta.user_id,
         ta.attempt_number,
         ta.status,
         ta.started_at,
         ta.expires_at,
         t.title,
         t.pass_percentage,
         t.duration_minutes,
         t.questions_per_attempt
       FROM test_attempts ta
       JOIN tests t
         ON t.id = ta.test_id
       WHERE ta.id = $1
         AND ta.user_id = $2`,
      [attemptId, req.user.id],
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test attempt not found.",
      });
    }

    const attempt = attemptResult.rows[0];

    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({
        error: "This test attempt is no longer in progress.",
      });
    }

    const expirationResult = await pool.query(
      `SELECT NOW() > expires_at AS expired
       FROM test_attempts
       WHERE id = $1`,
      [attemptId],
    );

    if (expirationResult.rows[0].expired) {
      await pool.query(
        `UPDATE test_attempts
         SET
           status = 'EXPIRED',
           actual_duration = expires_at - started_at
         WHERE id = $1`,
        [attemptId],
      );

      return res.status(400).json({
        error: "This test attempt has expired.",
      });
    }

    const questionsResult = await pool.query(
      `SELECT
         aq.question_order,
         tq.id AS question_id,
         tq.question_text,
         qo.id AS option_id,
         qo.option_text
       FROM attempt_questions aq
       JOIN test_questions tq
         ON tq.id = aq.question_id
       JOIN question_options qo
         ON qo.question_id = tq.id
       WHERE aq.attempt_id = $1
       ORDER BY aq.question_order ASC, qo.id ASC`,
      [attemptId],
    );

    const questionsMap = new Map();

    for (const row of questionsResult.rows) {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          question_id: row.question_id,
          question_order: row.question_order,
          question_text: row.question_text,
          options: [],
        });
      }

      questionsMap.get(row.question_id).options.push({
        option_id: row.option_id,
        option_text: row.option_text,
      });
    }

    const answersResult = await pool.query(
      `SELECT
         question_id,
         option_id
       FROM attempt_answers
       WHERE attempt_id = $1`,
      [attemptId],
    );

    res.json({
      message: "Test attempt resumed successfully.",
      attempt: {
        id: attempt.id,
        test_id: attempt.test_id,
        attempt_number: attempt.attempt_number,
        started_at: attempt.started_at,
        expires_at: attempt.expires_at,
        status: attempt.status,
      },
      test: {
        id: attempt.test_id,
        title: attempt.title,
        duration_minutes: attempt.duration_minutes,
        questions_per_attempt: attempt.questions_per_attempt,
        pass_percentage: attempt.pass_percentage,
      },
      questions: Array.from(questionsMap.values()),
      answers: answersResult.rows,
    });
  } catch (err) {
    console.error("Error resuming test:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

/**
 * Save or update an answer during an active test attempt
 */
export const saveAnswer = async (req, res) => {
  const attemptId = parseInt(req.params.attemptId, 10);

  const { question_id, option_id } = req.body;

  if (!Number.isInteger(attemptId)) {
    return res.status(400).json({
      error: "Invalid attempt ID.",
    });
  }

  if (
    !Number.isInteger(Number(question_id)) ||
    !Number.isInteger(Number(option_id))
  ) {
    return res.status(400).json({
      error: "question_id and option_id are required.",
    });
  }

  try {
    // 1. Get the learner's attempt
    const attemptResult = await pool.query(
      `SELECT
         id,
         test_id,
         status,
         expires_at
       FROM test_attempts
       WHERE id = $1
         AND user_id = $2`,
      [attemptId, req.user.id],
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({
        error: "Test attempt not found.",
      });
    }

    const attempt = attemptResult.rows[0];

    // 2. Attempt must still be in progress
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({
        error: "This test attempt is no longer in progress.",
      });
    }

    // 3. Check expiration
    const expirationResult = await pool.query(
      `SELECT NOW() > expires_at AS expired
       FROM test_attempts
       WHERE id = $1`,
      [attemptId],
    );

    if (expirationResult.rows[0].expired) {
      await pool.query(
        `UPDATE test_attempts
         SET
           status = 'EXPIRED',
           actual_duration = expires_at - started_at
         WHERE id = $1`,
        [attemptId],
      );

      return res.status(400).json({
        error: "This test attempt has expired.",
      });
    }

    // 4. Make sure the question belongs to this attempt
    const questionResult = await pool.query(
      `SELECT question_id
       FROM attempt_questions
       WHERE attempt_id = $1
         AND question_id = $2`,
      [attemptId, Number(question_id)],
    );

    if (questionResult.rows.length === 0) {
      return res.status(400).json({
        error: "This question is not part of the test attempt.",
      });
    }

    // 5. Make sure the option belongs to the question
    const optionResult = await pool.query(
      `SELECT id
       FROM question_options
       WHERE id = $1
         AND question_id = $2`,
      [Number(option_id), Number(question_id)],
    );

    if (optionResult.rows.length === 0) {
      return res.status(400).json({
        error: "This option does not belong to the specified question.",
      });
    }

    // 6. Save or update the answer
    const answerResult = await pool.query(
      `INSERT INTO attempt_answers (
         attempt_id,
         question_id,
         option_id
       )
       VALUES ($1, $2, $3)
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET
         option_id = EXCLUDED.option_id
       RETURNING
         attempt_id,
         question_id,
         option_id`,
      [attemptId, Number(question_id), Number(option_id)],
    );

    res.json({
      message: "Answer saved successfully.",
      answer: answerResult.rows[0],
    });
  } catch (err) {
    console.error("Error saving test answer:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};
