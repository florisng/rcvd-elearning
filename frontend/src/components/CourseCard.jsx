import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./css/CourseCard.css";

const CourseCard = ({ course, isEnrolled }) => {
  const navigate = useNavigate();

  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const hours = Math.floor(course.duration / 3600);
  const minutes = Math.floor((course.duration % 3600) / 60);

  const durationStr = `${hours > 0 ? hours + "h " : ""}${minutes}m`;

  const formattedPrice =
    new Intl.NumberFormat("en-US").format(course.price) + " RWF";

  // Format course creation date
  const createdDate = course.created_at
    ? new Date(course.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleEnroll = async () => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "LEARNER") {
      setError("Only learners can enroll in courses.");
      return;
    }

    setEnrolling(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/courses/${course.id}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll in course.");
      }

      setMessage("Successfully enrolled in this course.");

      setTimeout(() => {
        navigate(`/courses/${course.id}`);
      }, 800);
    } catch (err) {
      console.error("Enrollment error:", err);
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="course-card">
      <div className="course-card-header">
        <span className="course-type-label">
          <i className="bi bi-book-half"></i>
          COURSE
        </span>

        <h2 className="course-title">{course.title}</h2>
      </div>

      <hr />

      <p className="course-description">{course.description}</p>

      <div className="course-info">
        <div className="course-meta-item">
          <i className="bi bi-person-fill"> </i>
          <span>
            <b>Instructor:</b> {course.instructor_name}
          </span>
        </div>

        <div className="course-meta-item">
          <i className="bi bi-clock-fill"> </i>
          <span>
            <b>Duration:</b> {durationStr}
          </span>
        </div>

        {course.target_professional_title && (
          <div className="course-professional-title">
            <i className="bi bi-person-badge"> </i>
            <span>
              <b>For:</b> {course.target_professional_title}
            </span>
          </div>
        )}

        <div className="course-meta-item">
          <i className="bi bi-calendar3"> </i>
          <span>
            <b>Created:</b> {createdDate}
          </span>
        </div>
      </div>

      <div className="course-price">
        <span className="course-price-label">Course fee: </span>
        <strong>{formattedPrice}</strong>
      </div>

      {isEnrolled && (
        <div className="alert alert-success py-2">
          You are already enrolled in this course.
        </div>
      )}

      {message && !isEnrolled && (
        <div className="alert alert-success py-2">{message}</div>
      )}

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {isEnrolled ? (
        <button
          type="button"
          className="btn btn-link p-0"
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          Continue Course
        </button>
      ) : (
        <button
          type="button"
          className="btn enroll-btn"
          onClick={handleEnroll}
          disabled={enrolling}
        >
          {enrolling ? "Enrolling..." : "Enroll in this course"}
        </button>
      )}
    </div>
  );
};

export default CourseCard;
