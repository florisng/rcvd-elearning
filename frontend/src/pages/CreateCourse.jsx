import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./css/CreateCourse.css";

const CreateCourse = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_professional_title: "",
    price: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validate title
    if (!formData.title.trim()) {
      setError("Course title is required.");
      return;
    }

    // Validate description
    if (!formData.description.trim()) {
      setError("Course description is required.");
      return;
    }

    // Validate price
    if (!formData.price) {
      setError("Course price is required.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/instructor/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          target_professional_title: formData.target_professional_title,
          price: Number(formData.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create course.");
      }

      // The backend returns the created course inside data.course
      const createdCourse = data.course;

      if (!createdCourse || !createdCourse.id) {
        throw new Error(
          "Course was created, but the course ID was not returned.",
        );
      }

      // Open the Course Builder immediately
      navigate(`/instructor/courses/${createdCourse.id}/builder`);
    } catch (err) {
      console.error("Error creating course:", err);

      setError(err.message || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-register-card">
        <div className="auth-heading">
          <h2>Create New Course</h2>

          <p>
            Provide the basic information for your veterinary learning course.
            You will add chapters and subchapters after creating the course.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-section">
            <div className="auth-section-heading">
              <i className="bi bi-book"></i>

              <div>
                <h3>Course Information</h3>
                <p>Provide the basic information about your course.</p>
              </div>
            </div>

            {/* Course Title */}
            <div className="auth-field">
              <label htmlFor="title">Course title</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-book"></i>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  required
                />
              </div>
            </div>

            {/* Course Description */}
            <div className="auth-field">
              <label htmlFor="description">Course description</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-card-text"></i>

                <input
                  id="description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what learners will learn in this course"
                  required
                />
              </div>
            </div>

            {/* Dedicated Professional Title */}
            <div className="auth-field">
              <label htmlFor="target_professional_title">
                This course is dedicated to...
              </label>

              <div className="auth-input-wrapper">
                <i className="bi bi-person-badge"></i>

                <select
                  id="target_professional_title"
                  name="target_professional_title"
                  value={formData.target_professional_title}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select professional title</option>
                  <option value="Veterinary Technician (A1, A2)">
                    Veterinary Technician (A1, A2)
                  </option>
                  <option value="Veterinary Technologist">
                    Veterinary Technologist
                  </option>
                  <option value="Animal Scientist">Animal Scientist</option>
                  <option value="Veterinary Doctor">Veterinary Doctor</option>
                </select>
              </div>
            </div>

            {/* Course Price */}
            <div className="auth-field">
              <label htmlFor="price">Price (RWF)</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-cash"></i>

                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 45000"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating Course...
              </>
            ) : (
              <>
                Create Course
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>

          <button
            type="button"
            className="auth-secondary-btn"
            onClick={() => navigate("/instructor/dashboard")}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
