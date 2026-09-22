import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/InstructorDashboard.css";
import API_URL from "../api";
import Modal from "../components/Modal";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Delete loading
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  // Error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/api/instructor/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching instructor courses:", err);
        setError("Failed to load courses.");
        setLoading(false);
      });
  }, []);

  /**
   * Open Delete Confirmation Modal
   */
  const openDeleteModal = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
    setError("");
  };

  /**
   * Close Delete Confirmation Modal
   */
  const closeDeleteModal = () => {
    if (deletingCourseId) {
      return;
    }

    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  /**
   * Delete Course
   */
  const handleDeleteCourse = async () => {
    if (!courseToDelete) {
      return;
    }

    const courseId = courseToDelete.id;

    try {
      setDeletingCourseId(courseId);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/instructor/courses/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete course.");
      }

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId),
      );

      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error("Error deleting course:", err);
      setError(err.message || "Failed to delete course.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="instructor-dashboard-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      {/* =========================
          DASHBOARD HEADER
      ========================== */}
      <div className="instructor-dashboard-header">
        <div>
          <span className="dashboard-eyebrow">INSTRUCTOR PORTAL</span>

          <h1>Instructor Dashboard</h1>

          <p className="welcome-text">
            Welcome back, <strong>{user?.firstname}</strong>. Manage your
            courses, learning content, and assessments from here.
          </p>
        </div>

        <button
          className="create-course-btn"
          onClick={() => navigate("/instructor/courses/create")}
        >
          <i className="bi bi-plus-lg"></i>
          Create Course
        </button>
      </div>

      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div className="instructor-error" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {/* =========================
          SUMMARY
      ========================== */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="bi bi-journal-bookmark-fill"></i>
          </div>

          <div>
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="bi bi-pencil-square"></i>
          </div>

          <div>
            <span>Course Management</span>
            <strong>Active</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <i className="bi bi-clipboard-check"></i>
          </div>

          <div>
            <span>Assessments</span>
            <strong>Available</strong>
          </div>
        </div>
      </div>

      {/* =========================
          COURSES SECTION
      ========================== */}
      <div className="courses-section">
        <div className="courses-section-header">
          <div>
            <h2>Your Courses</h2>
            <p>Manage and prepare your courses for learners.</p>
          </div>

          {courses.length > 0 && (
            <span className="course-count">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="empty-courses">
            <div className="empty-courses-icon">
              <i className="bi bi-journal-plus"></i>
            </div>

            <h3>No courses yet</h3>

            <p>
              You have not created any courses yet. Start by creating your first
              course.
            </p>

            <button
              className="create-course-btn"
              onClick={() => navigate("/instructor/courses/create")}
            >
              <i className="bi bi-plus-lg"></i>
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="instructor-courses">
            {courses.map((course) => (
              <div key={course.id} className="instructor-course-card">
                <div className="course-card-top">
                  <div className="course-icon">
                    <i className="bi bi-book-half"></i>
                  </div>

                  <span className="course-status">Course</span>
                </div>

                <div className="course-card-content">
                  <h3>{course.title}</h3>

                  <p className="course-description">
                    {course.description || "No description provided."}
                  </p>

                  <div className="course-meta">
                    <div>
                      <i className="bi bi-cash-stack"></i>
                      <span>
                        {Number(course.price || 0).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="course-card-actions">
                  <button
                    className="manage-course-btn"
                    onClick={() =>
                      navigate(`/instructor/courses/${course.id}/builder`)
                    }
                  >
                    <i className="bi bi-pencil-square"></i>
                    Manage Course
                  </button>

                  <button
                    className="delete-course-btn"
                    onClick={() => openDeleteModal(course)}
                    disabled={deletingCourseId === course.id}
                    title="Delete course"
                  >
                    {deletingCourseId === course.id ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      ></span>
                    ) : (
                      <i className="bi bi-trash"></i>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================
          DELETE CONFIRMATION MODAL
      ========================== */}
      <Modal
        show={showDeleteModal}
        type="warning"
        title="Confirm Deletion"
        message={
          courseToDelete
            ? `Are you sure you want to delete "${courseToDelete.title}"? This will also delete all chapters and subchapters belonging to this course. This action cannot be undone.`
            : ""
        }
        onClose={closeDeleteModal}
        onConfirm={handleDeleteCourse}
        confirmText={deletingCourseId ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </div>
  );
};

export default InstructorDashboard;
