import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./css/LearnerCourse.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapterProgress, setChapterProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // =========================================
        // GET ENROLLED COURSE
        // =========================================

        const courseRes = await fetch(`${API_URL}/api/my-courses/${id}`, {
          headers,
        });

        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          throw new Error(courseData.error || "Failed to load course.");
        }

        setCourse(courseData.course);
        console.log("COURSE DATA:", courseData.course);

        // =========================================
        // GET CHAPTER-BASED LEARNING PROGRESS
        // =========================================

        const chapterProgressRes = await fetch(
          `${API_URL}/api/courses/${id}/chapter-progress`,
          {
            headers,
          },
        );

        const chapterProgressData = await chapterProgressRes.json();

        if (!chapterProgressRes.ok) {
          throw new Error(
            chapterProgressData.error || "Failed to load chapter progress.",
          );
        }

        setChapterProgress(chapterProgressData);
        console.log("CHAPTER PROGRESS DATA:", chapterProgressData);
      } catch (err) {
        console.error("Error loading course:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // =========================================
  // GET PROGRESS FOR A SPECIFIC CHAPTER
  // =========================================

  const getChapterProgress = (chapterId) => {
    return chapterProgress?.chapters?.find(
      (item) => String(item.chapter_id) === String(chapterId),
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="learner-course-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p>Loading course...</p>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="container py-5">
        <div className="learner-course-error">
          <div className="error-icon">
            <i className="bi bi-exclamation-triangle"></i>
          </div>

          <h3>Unable to load this course</h3>

          <p>{error}</p>

          <button
            className="btn enroll-btn"
            onClick={() => navigate("/courses")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  // =========================================
  // COURSE PROGRESS
  // =========================================

  const isCompleted = chapterProgress?.all_completed === true;

  const totalChapters = chapterProgress?.total_chapters || 0;

  const completedChapters = chapterProgress?.completed_chapters || 0;

  const chapterPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // =========================================
  // COURSE CREATION DATE
  // =========================================

  const createdDate = course.created_at
    ? new Date(course.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="learner-course-page">
      <div className="container py-4 py-md-5">
        {/* =========================================
            BACK
        ========================================= */}

        <button
          className="course-back-link"
          onClick={() => navigate("/courses")}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Courses
        </button>

        {/* =========================================
            COURSE HERO
        ========================================= */}

        <section className="course-hero">
          <div className="course-hero-content">
            <span className="course-label">
              <i className="bi bi-book-half me-2"></i>
              MY COURSE
            </span>

            <h1>{course.title}</h1>

            <p className="course-description">{course.description}</p>

            {/* Instructor */}

            <div className="course-instructor-info">
              <div className="instructor-avatar">
                <i className="bi bi-person-fill"></i>
              </div>

              <div>
                <span>Instructor</span>

                <strong>
                  {course.instructor_firstname} {course.instructor_lastname}
                </strong>
              </div>
            </div>

            {/* Created Date */}

            <div className="course-instructor-info">
              <div className="instructor-avatar">
                <i className="bi bi-calendar3"></i>
              </div>

              <div>
                <span>Created</span>

                <strong>{createdDate}</strong>
              </div>
            </div>
          </div>

          <div className="course-hero-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
        </section>

        {/* =========================================
            COURSE PROGRESS
        ========================================= */}

        <section className="course-progress-card">
          <div className="progress-card-top">
            <div>
              <span className="progress-label">COURSE PROGRESS</span>

              <h3>
                {isCompleted
                  ? "Course completed!"
                  : "Keep going, you're doing great!"}
              </h3>
            </div>

            <div
              className={`progress-percentage ${isCompleted ? "complete" : ""}`}
            >
              {chapterPercentage}%
            </div>
          </div>

          {/* Progress bar */}

          <div className="course-progress-track">
            <div
              className={`course-progress-fill ${
                isCompleted ? "complete" : ""
              }`}
              style={{
                width: `${chapterPercentage}%`,
              }}
            />
          </div>

          {/* Progress summary */}

          <div className="progress-card-bottom">
            <span>
              <i className="bi bi-check-circle-fill me-1"></i>
              {completedChapters} completed
            </span>

            <span>
              <i className="bi bi-circle me-1"></i>
              {totalChapters - completedChapters} remaining
            </span>

            {totalChapters > 0 && (
              <span className="total-lessons">{totalChapters} chapters</span>
            )}
          </div>

          {/* Completed message */}

          {isCompleted && (
            <div className="course-completed-message">
              <div className="completed-icon">
                <i className="bi bi-award-fill"></i>
              </div>

              <div>
                <strong>Congratulations!</strong>

                <p>You have completed all the lessons in this course.</p>
              </div>
            </div>
          )}
        </section>

        {/* =========================================
            COURSE CONTENT HEADER
        ========================================= */}

        <div className="content-heading">
          <div>
            <span className="course-label">YOUR LEARNING</span>

            <h2>Course Content</h2>
          </div>

          <div className="content-count">
            <i className="bi bi-list-ul me-2"></i>
            {course.chapters?.length || 0} Chapters
          </div>
        </div>

        {/* =========================================
            CHAPTERS
        ========================================= */}

        <div className="chapters-container">
          {course.chapters?.map((chapter, index) => {
            const chapterStatus = getChapterProgress(chapter.id);

            const completed = chapterStatus?.completed === true;

            const learningTime = chapterStatus?.learning_time_seconds || 0;

            const requiredTime = chapterStatus?.required_time_seconds || 0;

            const chapterProgressPercentage =
              requiredTime > 0
                ? Math.min(100, Math.round((learningTime / requiredTime) * 100))
                : completed
                  ? 100
                  : 0;

            return (
              <section
                className={`chapter-card ${
                  completed ? "chapter-completed" : ""
                }`}
                key={chapter.id}
              >
                {/* =================================
                      CHAPTER HEADER
                  ================================= */}

                <div className="chapter-header">
                  <div className="chapter-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div
                    className="chapter-title-wrapper"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(`/chapters/${chapter.id}/learn?courseId=${id}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();

                        navigate(
                          `/chapters/${chapter.id}/learn?courseId=${id}`,
                        );
                      }
                    }}
                  >
                    <span>CHAPTER {index + 1}</span>

                    <h3>{chapter.title}</h3>

                    {/* Chapter Status */}

                    {completed ? (
                      <span className="completed-badge">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Completed
                      </span>
                    ) : learningTime > 0 ? (
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        In progress
                      </small>
                    ) : (
                      <small className="text-muted">
                        <i className="bi bi-play-circle me-1"></i>
                        Start learning
                      </small>
                    )}
                  </div>

                  <div className="chapter-icon">
                    <i className="bi bi-journal-text"></i>
                  </div>
                </div>

                {/* =================================
                      CHAPTER LEARNING PROGRESS
                  ================================= */}

                {!completed && learningTime > 0 && (
                  <div className="px-4 pb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Learning progress</small>

                      <small className="text-muted">
                        {chapterProgressPercentage}%
                      </small>
                    </div>

                    <div
                      className="progress"
                      style={{
                        height: "6px",
                      }}
                    >
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${chapterProgressPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* =================================
                      SUBCHAPTERS
                  ================================= */}

                <div className="subchapters">
                  {chapter.subchapters?.map((subchapter, subIndex) => (
                    <article
                      key={subchapter.id}
                      className={`lesson-item ${
                        completed ? "lesson-completed" : ""
                      }`}
                    >
                      {/* Lesson Number */}

                      <div className="lesson-number">
                        {completed ? (
                          <i className="bi bi-check-lg"></i>
                        ) : (
                          `${index + 1}.${subIndex + 1}`
                        )}
                      </div>

                      {/* Lesson Content */}

                      <div className="lesson-content">
                        <div className="lesson-heading">
                          <h4>{subchapter.title}</h4>

                          {completed && (
                            <span className="completed-badge">
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Completed
                            </span>
                          )}
                        </div>

                        <p>{subchapter.content}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* =========================================
            FINAL TEST
        ========================================= */}

        <div className="course-test-section">
          <div className="course-test-card">
            <div className="test-icon">
              <i className="bi bi-file-earmark-check-fill"></i>
            </div>

            <div className="test-content">
              <span className="course-label">FINAL ASSESSMENT</span>

              <h2>Final Test</h2>

              <p>
                Complete the final test to evaluate your knowledge of this
                course.
              </p>

              {!isCompleted && (
                <div className="test-locked-message">
                  <i className="bi bi-lock-fill me-2"></i>
                  Complete all course lessons to unlock the test.
                </div>
              )}

              {isCompleted && (
                <div className="text-success mt-2">
                  <i className="bi bi-unlock-fill me-2"></i>
                  All chapters completed. The test is now available.
                </div>
              )}
            </div>

            <div className="test-action">
              <button
                className="btn btn-primary px-4"
                disabled={!isCompleted}
                onClick={() => navigate(`/tests/${course.test_id}`)}
              >
                <i className="bi bi-play-circle me-2"></i>
                Start Test
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            BOTTOM NAVIGATION
        ========================================= */}

        <div className="course-bottom-navigation">
          <button
            className="course-back-btn"
            onClick={() => navigate("/courses")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Courses
          </button>

          {isCompleted && (
            <div className="course-finished">
              <i className="bi bi-patch-check-fill me-2"></i>
              Course completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
