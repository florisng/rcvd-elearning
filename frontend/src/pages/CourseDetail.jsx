import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./css/LearnerCourse.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedSubchapters, setCompletedSubchapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Get enrolled course
        const courseRes = await fetch(`${API_URL}/api/my-courses/${id}`, {
          headers,
        });

        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          throw new Error(courseData.error || "Failed to load course.");
        }

        // Get learner progress
        const progressRes = await fetch(
          `${API_URL}/api/my-courses/${id}/progress`,
          { headers },
        );

        const progressData = await progressRes.json();

        if (!progressRes.ok) {
          throw new Error(
            progressData.error || "Failed to load course progress.",
          );
        }

        setCourse(courseData.course);
        setProgress(progressData.progress);

        setCompletedSubchapters(
          progressData.completed_subchapters?.map(
            (item) => item.subchapter_id,
          ) || [],
        );
      } catch (err) {
        console.error("Error loading course:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const markAsCompleted = async (subchapterId) => {
    try {
      setCompleting(subchapterId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/subchapters/${subchapterId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to mark subchapter as completed.",
        );
      }

      setCompletedSubchapters((prev) => {
        if (prev.includes(subchapterId)) {
          return prev;
        }

        return [...prev, subchapterId];
      });

      // Refresh progress
      const progressRes = await fetch(
        `${API_URL}/api/my-courses/${id}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const progressData = await progressRes.json();

      if (progressRes.ok) {
        setProgress(progressData.progress);
      }
    } catch (err) {
      console.error("Error completing subchapter:", err);
      alert(err.message);
    } finally {
      setCompleting(null);
    }
  };

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

  const isCompleted = progress?.percentage === 100;

  const totalSubchapters =
    (progress?.completed_subchapters || 0) +
    (progress?.remaining_subchapters || 0);

  // Format course creation date
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

            {/* Course Created Date */}
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

        {progress && (
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
                className={`progress-percentage ${
                  isCompleted ? "complete" : ""
                }`}
              >
                {progress.percentage}%
              </div>
            </div>

            <div className="course-progress-track">
              <div
                className={`course-progress-fill ${
                  isCompleted ? "complete" : ""
                }`}
                style={{
                  width: `${progress.percentage}%`,
                }}
              />
            </div>

            <div className="progress-card-bottom">
              <span>
                <i className="bi bi-check-circle-fill me-1"></i>
                {progress.completed_subchapters} completed
              </span>

              <span>
                <i className="bi bi-circle me-1"></i>
                {progress.remaining_subchapters} remaining
              </span>

              {totalSubchapters > 0 && (
                <span className="total-lessons">
                  {totalSubchapters} lessons
                </span>
              )}
            </div>

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
        )}

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
          {course.chapters?.map((chapter, index) => (
            <section className="chapter-card" key={chapter.id}>
              {/* Chapter Header */}

              <div className="chapter-header">
                <div className="chapter-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="chapter-title-wrapper">
                  <span>CHAPTER {index + 1}</span>

                  <h3>{chapter.title}</h3>
                </div>

                <div className="chapter-icon">
                  <i className="bi bi-journal-text"></i>
                </div>
              </div>

              {/* Subchapters */}

              <div className="subchapters">
                {chapter.subchapters?.map((subchapter, subIndex) => {
                  const completed = completedSubchapters.includes(
                    subchapter.id,
                  );

                  const isSaving = completing === subchapter.id;

                  return (
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

                        {/* Mark Completed */}

                        {!completed && (
                          <button
                            className="complete-lesson-btn"
                            disabled={isSaving}
                            onClick={() => markAsCompleted(subchapter.id)}
                          >
                            {isSaving ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check2-circle me-2"></i>
                                Mark as completed
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
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
            </div>

            <div className="test-action">
              <button
                className="btn btn-primary px-4"
                disabled={!isCompleted}
                onClick={() => navigate(`/tests/${id}`)}
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
