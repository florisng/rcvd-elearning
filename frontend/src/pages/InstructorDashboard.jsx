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
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching instructor courses:", err);
        setError("Failed to load courses.");
        setLoading(false);
      });
  }, [user]);

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

      // Remove the deleted course immediately from the dashboard
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId),
      );

      // Close modal after successful deletion
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
    return <p className="loading-text">Loading dashboard...</p>;
  }

  return (
    <div className="instructor-dashboard">
      <h1>Instructor Dashboard</h1>

      <p className="welcome-text">
        Welcome back, <strong>{user.firstname}</strong>
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="dashboard-section-header">
        <h2>Your Courses</h2>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/instructor/courses/create")}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <p>You have not created any courses yet.</p>
      ) : (
        <div className="instructor-courses">
          {courses.map((course) => (
            <div key={course.id} className="instructor-course-card">
              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <p>
                <b>Price:</b> {Number(course.price).toLocaleString()} RWF
              </p>

              <p>
                <b>Duration:</b> {Math.floor(course.duration / 3600)}h{" "}
                {Math.floor((course.duration % 3600) / 60)}m
              </p>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    navigate(`/instructor/courses/${course.id}/builder`);
                  }}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                  Manage Course
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => openDeleteModal(course)}
                  disabled={deletingCourseId === course.id}
                >
                  {deletingCourseId === course.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
