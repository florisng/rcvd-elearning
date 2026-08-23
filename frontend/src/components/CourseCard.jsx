import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./css/CourseCard.css";

const CourseCard = ({ course }) => {
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
        if (data.error === "You are already enrolled in this course.") {
          setMessage("You are already enrolled in this course.");
        } else {
          throw new Error(data.error || "Failed to enroll in course.");
        }

        return;
      }

      setMessage("Successfully enrolled in this course.");

      setTimeout(() => {
        navigate(`/learner/course/${course.id}`);
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
      <p>
        <Link
          to={`/courses/${course.id}`}
          id={`course-${course.id}`}
          className="link right"
        >
          View course
        </Link>
      </p>

      <h2 className="course-title">{course.title}</h2>

      <hr />

      <p className="course-description">{course.description}</p>

      <div className="course-info">
        <span className="course-instructor">
          <b>Instructor: </b>
          {course.instructor_name}
        </span>

        <br />

        <span className="course-duration">
          <b>Duration: </b>
          {durationStr}
        </span>
      </div>

      <p className="course-price">
        <b>Price: </b>
        {formattedPrice}
      </p>

      {message && <div className="alert alert-success py-2">{message}</div>}

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <button
        type="button"
        className="btn enroll-btn w-100"
        onClick={handleEnroll}
        disabled={enrolling}
      >
        {enrolling ? "Enrolling..." : "Enroll in Course"}
      </button>
    </div>
  );
};

export default CourseCard;
