import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "./css/AdminCourses.css";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load courses.");
      }

      setCourses(data.courses || []);
    } catch (err) {
      console.error("Error fetching admin courses:", err);
      setError(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getStatusClass = (status) => {
    if (status === "PUBLISHED") {
      return "course-status published";
    }

    return "course-status draft";
  };

  if (loading) {
    return (
      <div className="admin-courses-page">
        <div className="admin-courses-state">
          <div className="admin-courses-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-courses-page">
      <div className="admin-courses-container">
        <header className="admin-courses-header">
          <div>
            <span className="admin-courses-label">COURSE MANAGEMENT</span>
            <h1>Courses</h1>
            <p>
              View and manage courses available on the RCVD E-learning platform.
            </p>
          </div>

          <button
            type="button"
            className="refresh-courses-btn"
            onClick={fetchCourses}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-courses-error">
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <section className="admin-courses-section">
          <div className="courses-section-heading">
            <div>
              <span className="courses-section-eyebrow">COURSE DIRECTORY</span>

              <h2>All Courses</h2>

              <p>
                Courses created by instructors on the RCVD E-learning platform.
              </p>
            </div>

            <span className="courses-section-count">{courses.length}</span>
          </div>

          {courses.length === 0 ? (
            <div className="admin-courses-empty">
              <div className="admin-courses-empty-icon">
                <i className="bi bi-journal-richtext"></i>
              </div>

              <h2>No courses yet</h2>

              <p>There are currently no courses available on the platform.</p>
            </div>
          ) : (
            <div className="admin-courses-table-wrapper">
              <table className="admin-courses-table">
                <thead>
                  <tr>
                    <th>COURSE</th>
                    <th>INSTRUCTOR</th>
                    <th>PROFESSIONAL TITLE</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className="admin-course-name">
                          <div className="admin-course-icon">
                            <i className="bi bi-journal-text"></i>
                          </div>

                          <div>
                            <Link
                              to={`/courses/${course.id}`}
                              className="admin-course-title-link"
                            >
                              {course.title}
                            </Link>

                            <span>Course #{course.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {course.instructor_first_name ||
                        course.instructor_last_name
                          ? `${course.instructor_first_name || ""} ${
                              course.instructor_last_name || ""
                            }`.trim()
                          : "Not assigned"}
                      </td>

                      <td>
                        {course.target_professional_title || "Not specified"}
                      </td>

                      <td>
                        <span className={getStatusClass(course.status)}>
                          <i
                            className={
                              course.status === "PUBLISHED"
                                ? "bi bi-check-circle-fill"
                                : "bi bi-pencil-square"
                            }
                          ></i>

                          {course.status}
                        </span>
                      </td>

                      <td>
                        {course.created_at
                          ? new Date(course.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminCourses;
