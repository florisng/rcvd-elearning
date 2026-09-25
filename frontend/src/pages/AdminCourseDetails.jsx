import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../api";
import "./css/AdminCourseDetails.css";

const AdminCourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/courses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load course.");
        }

        setCourse(data.course || data);
      } catch (err) {
        console.error("Error fetching admin course:", err);
        setError(err.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, token]);

  if (loading) {
    return (
      <div className="admin-course-details-page">
        <div className="admin-course-details-state">
          <div className="admin-course-details-spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-course-details-page">
        <div className="admin-course-details-state error-state">
          <div className="admin-course-details-error-icon">
            <i className="bi bi-exclamation-circle"></i>
          </div>

          <h2>Unable to load course</h2>
          <p>{error}</p>

          <Link to="/admin/courses" className="admin-course-back-btn">
            <i className="bi bi-arrow-left"></i>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="admin-course-details-page">
        <div className="admin-course-details-state">
          <h2>Course not found</h2>

          <Link to="/admin/courses" className="admin-course-back-btn">
            <i className="bi bi-arrow-left"></i>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-course-details-page">
      <div className="admin-course-details-container">
        <div className="admin-course-details-topbar">
          <Link to="/admin/courses" className="admin-course-back-link">
            <i className="bi bi-arrow-left"></i>
            Back to Courses
          </Link>
        </div>

        <section className="admin-course-details-card">
          <div className="admin-course-details-icon">
            <i className="bi bi-journal-richtext"></i>
          </div>

          <div className="admin-course-details-main">
            <span className="admin-course-details-label">COURSE DETAILS</span>

            <h1>{course.title}</h1>

            <p className="admin-course-details-description">
              {course.description || "No course description provided."}
            </p>

            <span
              className={`admin-course-details-status ${
                course.status === "PUBLISHED" ? "published" : "draft"
              }`}
            >
              <i
                className={
                  course.status === "PUBLISHED"
                    ? "bi bi-check-circle-fill"
                    : "bi bi-pencil-square"
                }
              ></i>

              {course.status}
            </span>
          </div>
        </section>

        <section className="admin-course-info-section">
          <div className="admin-course-info-heading">
            <span>COURSE INFORMATION</span>
            <h2>Overview</h2>
          </div>

          <div className="admin-course-info-grid">
            <div className="admin-course-info-item">
              <span>Professional Title</span>
              <strong>
                {course.target_professional_title || "Not specified"}
              </strong>
            </div>

            <div className="admin-course-info-item">
              <span>Price</span>
              <strong>
                {course.price !== null && course.price !== undefined
                  ? `${Number(course.price).toLocaleString()} RWF`
                  : "Not specified"}
              </strong>
            </div>

            <div className="admin-course-info-item">
              <span>Instructor</span>
              <strong>
                {course.instructor_first_name || course.instructor_last_name
                  ? `${course.instructor_first_name || ""} ${
                      course.instructor_last_name || ""
                    }`.trim()
                  : "Not assigned"}
              </strong>
            </div>

            <div className="admin-course-info-item">
              <span>Created</span>
              <strong>
                {course.created_at
                  ? new Date(course.created_at).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

            <div className="admin-course-info-item">
              <span>Course ID</span>
              <strong>#{course.id}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCourseDetails;
