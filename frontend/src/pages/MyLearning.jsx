import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "./css/MyLearning.css";

const MyLearning = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchMyLearning = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || user?.role !== "LEARNER") {
          setCourses([]);
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // =========================================
        // GET ENROLLED COURSES
        // =========================================

        const res = await fetch(`${API_URL}/api/my-courses`, {
          headers,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load your courses.");
        }

        setCourses(data);

        // =========================================
        // GET COURSE PROGRESS
        // =========================================

        const progressResults = await Promise.all(
          data.map(async (course) => {
            try {
              const progressRes = await fetch(
                `${API_URL}/api/my-courses/${course.course_id}/progress`,
                {
                  headers,
                },
              );

              const progressData = await progressRes.json();

              if (!progressRes.ok) {
                return {
                  courseId: course.course_id,
                  progress: null,
                };
              }

              return {
                courseId: course.course_id,
                progress: progressData.progress,
              };
            } catch (err) {
              console.error(
                `Error loading progress for course ${course.course_id}:`,
                err,
              );

              return {
                courseId: course.course_id,
                progress: null,
              };
            }
          }),
        );

        const progressMap = {};

        progressResults.forEach((item) => {
          progressMap[item.courseId] = item.progress;
        });

        setProgress(progressMap);
      } catch (err) {
        console.error("Error loading My Learning:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLearning();
  }, []);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="my-learning-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p>Loading your learning...</p>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="my-learning-page">
        <div className="container py-5">
          <div className="my-learning-error">
            <div className="error-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h3>Unable to load your learning</h3>

            <p>{error}</p>

            <button
              className="my-learning-btn"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // EMPTY STATE
  // =========================================

  if (courses.length === 0) {
    return (
      <div className="my-learning-page">
        <div className="container py-5">
          <div className="my-learning-header">
            <span className="my-learning-label">YOUR LEARNING</span>

            <h1>My Learning</h1>

            <p>
              Access your enrolled courses, track your progress, and continue
              your professional learning journey.
            </p>
          </div>

          <div className="my-learning-empty">
            <div className="empty-learning-icon">
              <i className="bi bi-journal-x"></i>
            </div>

            <h2>No Courses Yet</h2>

            <p>
              You are not enrolled in any courses yet. Explore the available
              courses and start your learning journey with RCVD.
            </p>

            <Link to="/courses" className="my-learning-btn">
              <i className="bi bi-search me-2"></i>
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="my-learning-page">
      <div className="container py-5">
        {/* =========================================
            HEADER
        ========================================= */}

        <div className="my-learning-header">
          <span className="my-learning-label">YOUR LEARNING</span>

          <h1>
            My Learning
            {user?.first_name ? `, ${user.first_name}` : ""}
          </h1>

          <p>
            Continue your professional learning journey with your enrolled RCVD
            courses.
          </p>
        </div>

        {/* =========================================
            SUMMARY
        ========================================= */}

        <div className="learning-summary">
          <div className="learning-summary-item">
            <div className="summary-icon">
              <i className="bi bi-journal-bookmark-fill"></i>
            </div>

            <div>
              <strong>{courses.length}</strong>
              <span>Enrolled Courses</span>
            </div>
          </div>

          <div className="learning-summary-item">
            <div className="summary-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>

            <div>
              <strong>
                {
                  courses.filter((course) => {
                    const courseProgress = progress[course.course_id];

                    return (
                      course.status === "COMPLETED" ||
                      courseProgress?.percentage === 100
                    );
                  }).length
                }
              </strong>

              <span>Completed</span>
            </div>
          </div>

          <div className="learning-summary-item">
            <div className="summary-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>

            <div>
              <strong>
                {
                  courses.filter((course) => {
                    const courseProgress = progress[course.course_id];

                    return (
                      course.status !== "COMPLETED" &&
                      courseProgress?.percentage !== 100
                    );
                  }).length
                }
              </strong>

              <span>In Progress</span>
            </div>
          </div>
        </div>

        {/* =========================================
            COURSES HEADER
        ========================================= */}

        <div className="my-learning-section-header">
          <div>
            <span className="my-learning-label">ENROLLED COURSES</span>

            <h2>Your Courses</h2>
          </div>

          <Link to="/courses" className="browse-courses-link">
            Browse Courses
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>

        {/* =========================================
            COURSE GRID
        ========================================= */}

        <div className="row g-4">
          {courses.map((course) => {
            const courseProgress = progress[course.course_id];

            const percentage = courseProgress?.percentage ?? 0;

            const isCompleted =
              course.status === "COMPLETED" || percentage === 100;

            return (
              <div className="col-12 col-md-6 col-xl-4" key={course.course_id}>
                <div className="my-learning-card">
                  {/* Course Header */}

                  <div className="my-learning-card-header">
                    <div className="my-learning-card-icon">
                      <i className="bi bi-book-half"></i>
                    </div>

                    <span
                      className={`learning-status ${
                        isCompleted
                          ? "learning-status-completed"
                          : "learning-status-progress"
                      }`}
                    >
                      {isCompleted ? "COMPLETED" : "IN PROGRESS"}
                    </span>
                  </div>

                  {/* Course Content */}

                  <div className="my-learning-card-body">
                    <h3>{course.title}</h3>

                    <p className="my-learning-description">
                      {course.description ||
                        "Continue learning and complete this course."}
                    </p>

                    {/* Instructor */}

                    <div className="my-learning-instructor">
                      <i className="bi bi-person-circle"></i>

                      <span>
                        {course.instructor_firstname}{" "}
                        {course.instructor_lastname}
                      </span>
                    </div>

                    {/* Progress */}

                    <div className="my-learning-progress">
                      <div className="progress-heading">
                        <span>Course Progress</span>

                        <strong>{percentage}%</strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className={`progress-fill ${
                            isCompleted ? "progress-completed" : ""
                          }`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      {courseProgress && (
                        <div className="progress-details">
                          <span>
                            {courseProgress.completed_subchapters || 0}{" "}
                            completed
                          </span>

                          <span>
                            {courseProgress.remaining_subchapters || 0}{" "}
                            remaining
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action */}

                    <Link
                      to={`/courses/${course.course_id}`}
                      className={`my-learning-action ${
                        isCompleted ? "my-learning-action-completed" : ""
                      }`}
                    >
                      {isCompleted ? "View Course" : "Continue Learning"}

                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
