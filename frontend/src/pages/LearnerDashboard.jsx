import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "./css/LearnerDashboard.css";

const LearnerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Get enrolled courses
        const res = await fetch(`${API_URL}/api/my-courses`, {
          headers,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load courses.");
        }

        setCourses(data);

        // Get progress for each course
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
        console.error("Error loading learner courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="learner-dashboard-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p>Loading your learning dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // =========================================
  // CALCULATE DASHBOARD STATISTICS
  // =========================================

  let completedCourses = 0;
  let inProgressCourses = 0;
  let totalProgress = 0;

  courses.forEach((course) => {
    const courseProgress = progress[course.course_id];

    const percentage = courseProgress?.percentage ?? 0;

    const isCompleted = course.status === "COMPLETED" || percentage === 100;

    if (isCompleted) {
      completedCourses++;
    } else {
      inProgressCourses++;
    }

    totalProgress += percentage;
  });

  const averageProgress =
    courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

  return (
    <div className="learner-dashboard">
      <div className="container py-5">
        {/* =========================================
            DASHBOARD HEADER
        ========================================= */}

        <div className="dashboard-header mb-5">
          <div>
            <span className="dashboard-label">RCVD E-LEARNING</span>

            <h1 className="dashboard-title">
              Welcome back
              {user?.first_name ? `, ${user.first_name}` : ""}! 👋
            </h1>

            <p className="dashboard-subtitle">
              Continue your professional learning journey with RCVD E-Learning.
            </p>
          </div>
        </div>

        {/* =========================================
            STATISTICS
        ========================================= */}

        <div className="row g-4 mb-5">
          {/* Enrolled Courses */}

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="dashboard-stat-card">
              <div className="stat-icon">
                <i className="bi bi-journal-bookmark-fill"></i>
              </div>

              <div>
                <div className="stat-number">{courses.length}</div>

                <div className="stat-label">Enrolled Courses</div>
              </div>
            </div>
          </div>

          {/* Completed Courses */}

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="dashboard-stat-card">
              <div className="stat-icon completed">
                <i className="bi bi-check-circle-fill"></i>
              </div>

              <div>
                <div className="stat-number">{completedCourses}</div>

                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>

          {/* In Progress */}

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="dashboard-stat-card">
              <div className="stat-icon progress-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>

              <div>
                <div className="stat-number">{inProgressCourses}</div>

                <div className="stat-label">In Progress</div>
              </div>
            </div>
          </div>

          {/* Average Progress */}

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="dashboard-stat-card">
              <div className="stat-icon average">
                <i className="bi bi-bar-chart-fill"></i>
              </div>

              <div>
                <div className="stat-number">{averageProgress}%</div>

                <div className="stat-label">Average Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            MY COURSES
        ========================================= */}

        <div className="courses-section-header">
          <div>
            <span className="dashboard-label">YOUR LEARNING</span>

            <h2 className="courses-section-title">My Courses</h2>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="empty-courses">
            <div className="empty-icon">
              <i className="bi bi-journal-x"></i>
            </div>

            <h4>No courses yet</h4>

            <p>
              You are not enrolled in any courses yet. Explore our available
              courses and start learning.
            </p>

            <Link to="/courses" className="dashboard-primary-btn">
              <i className="bi bi-search me-2"></i>
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {courses.map((course) => {
              const courseProgress = progress[course.course_id];

              const percentage = courseProgress?.percentage ?? 0;

              const isCompleted =
                course.status === "COMPLETED" || percentage === 100;

              return (
                <div
                  className="col-12 col-md-6 col-xl-4"
                  key={course.course_id}
                >
                  <div className="learner-course-card">
                    {/* Course Icon */}

                    <div className="course-card-icon">
                      <i className="bi bi-book-half"></i>
                    </div>

                    {/* Course Content */}

                    <div className="course-card-content">
                      <h5 className="course-card-title">{course.title}</h5>

                      <p className="course-card-description">
                        {course.description}
                      </p>

                      {/* Instructor */}

                      <div className="course-instructor">
                        <i className="bi bi-person-circle"></i>

                        <span>
                          {course.instructor_firstname}{" "}
                          {course.instructor_lastname}
                        </span>
                      </div>

                      {/* Status */}

                      <div className="course-status-row">
                        <span className="status-label">Status</span>

                        <span
                          className={`course-status ${
                            isCompleted ? "completed-status" : "progress-status"
                          }`}
                        >
                          {isCompleted ? "COMPLETED" : "IN PROGRESS"}
                        </span>
                      </div>

                      {/* Progress */}

                      <div className="course-progress">
                        <div className="progress-header">
                          <span>Progress</span>

                          <strong>{percentage}%</strong>
                        </div>

                        <div className="progress-track">
                          <div
                            className={`progress-fill ${
                              isCompleted ? "completed-progress" : ""
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        {courseProgress && (
                          <div className="progress-details">
                            <span>
                              {courseProgress.completed_subchapters} completed
                            </span>

                            <span>
                              {courseProgress.remaining_subchapters} remaining
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Button */}

                      <Link
                        to={`/courses/${course.course_id}`}
                        className={`course-action-btn ${
                          isCompleted ? "completed-action" : ""
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
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
