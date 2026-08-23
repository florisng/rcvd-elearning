import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

const LearnerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="container py-5 text-center">
        <p>Loading your courses...</p>
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

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-2">Learner Dashboard</h1>

        <p className="text-muted mb-0">Welcome to your learning dashboard.</p>
      </div>

      {/* Courses */}
      <h3 className="mb-4">My Courses</h3>

      {courses.length === 0 ? (
        <div className="alert alert-info">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <div className="row g-4">
          {courses.map((course) => {
            const courseProgress = progress[course.course_id];

            const percentage = courseProgress?.percentage ?? 0;

            const isCompleted =
              course.status === "COMPLETED" || percentage === 100;

            return (
              <div className="col-md-6 col-lg-4" key={course.course_id}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body p-4 d-flex flex-column">
                    {/* Title */}
                    <h5 className="card-title fw-bold">{course.title}</h5>

                    {/* Description */}
                    <p className="card-text text-muted">{course.description}</p>

                    {/* Instructor */}
                    <p className="mb-2">
                      <strong>Instructor:</strong> {course.instructor_firstname}{" "}
                      {course.instructor_lastname}
                    </p>

                    {/* Status */}
                    <p className="mb-3">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge ${
                          isCompleted ? "bg-success" : "bg-primary"
                        }`}
                      >
                        {isCompleted ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Progress</small>

                        <small className="fw-bold">{percentage}%</small>
                      </div>

                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className={`progress-bar ${
                            isCompleted ? "bg-success" : "bg-primary"
                          }`}
                          role="progressbar"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      {courseProgress && (
                        <small className="text-muted">
                          {courseProgress.completed_subchapters} completed ·{" "}
                          {courseProgress.remaining_subchapters} remaining
                        </small>
                      )}
                    </div>

                    {/* Button */}
                    <div className="mt-auto">
                      <Link
                        to={`/learner/course/${course.course_id}`}
                        className={`btn w-100 ${
                          isCompleted ? "btn-outline-success" : "btn-primary"
                        }`}
                      >
                        {isCompleted ? "View Course" : "Continue Learning"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
