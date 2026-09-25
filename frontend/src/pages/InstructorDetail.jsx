import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../api";
import "./css/InstructorDetail.css";

const InstructorDetail = () => {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/instructor/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load instructor.");
        }

        setInstructor(data);
      } catch (err) {
        console.error("Error fetching instructor:", err);
        setError(err.message || "Failed to load instructor.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <div className="instructor-detail-page">
        <div className="instructor-detail-state">
          <div className="instructor-detail-spinner"></div>
          <p>Loading instructor...</p>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="instructor-detail-page">
        <div className="instructor-detail-error">
          <div className="instructor-error-icon">
            <i className="bi bi-person-x"></i>
          </div>

          <h2>Instructor not found</h2>

          <p>
            {error || "The instructor you are looking for could not be found."}
          </p>

          <Link to="/instructors" className="instructor-back-btn">
            <i className="bi bi-arrow-left"></i>
            Back to Instructors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-detail-page">
      <div className="instructor-detail-container">
        <div className="instructor-detail-breadcrumb">
          <Link to="/instructors">
            <i className="bi bi-arrow-left"></i>
            Instructors
          </Link>

          <i className="bi bi-chevron-right"></i>

          <span>
            {instructor.firstname} {instructor.lastname}
          </span>
        </div>

        <section className="instructor-profile-card">
          <div className="instructor-profile-main">
            <div className="instructor-profile-avatar">
              {getInitials(instructor.firstname, instructor.lastname)}
            </div>

            <div className="instructor-profile-content">
              <div className="instructor-profile-heading">
                <div>
                  <span className="instructor-profile-label">
                    RCVD E-LEARNING INSTRUCTOR
                  </span>

                  <h1>
                    {instructor.firstname} {instructor.lastname}
                  </h1>

                  <p className="instructor-professional-title">
                    {instructor.bio || "RCVD E-learning Instructor"}
                  </p>
                </div>

                <span className="instructor-approved-badge">
                  <i className="bi bi-patch-check-fill"></i>
                  Approved Instructor
                </span>
              </div>

              <div className="instructor-contact-grid">
                <div className="instructor-contact-item">
                  <div className="instructor-contact-icon">
                    <i className="bi bi-envelope"></i>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{instructor.email}</strong>
                  </div>
                </div>

                <div className="instructor-contact-item">
                  <div className="instructor-contact-icon">
                    <i className="bi bi-telephone"></i>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{instructor.phone || "Not provided"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="instructor-content-grid">
          <section className="instructor-about-card">
            <div className="instructor-section-header">
              <div className="instructor-section-icon">
                <i className="bi bi-person"></i>
              </div>

              <div>
                <span>PROFILE</span>
                <h2>About the Instructor</h2>
              </div>
            </div>

            <div className="instructor-about-content">
              <p>
                {instructor.bio ||
                  "No biography has been provided for this instructor yet."}
              </p>
            </div>
          </section>

          <section className="instructor-courses-card">
            <div className="instructor-section-header">
              <div className="instructor-section-icon">
                <i className="bi bi-mortarboard"></i>
              </div>

              <div>
                <span>LEARNING</span>
                <h2>Courses</h2>
              </div>

              <span className="instructor-course-count">
                {instructor.courses?.length || 0}
              </span>
            </div>

            {instructor.courses?.length === 0 ? (
              <div className="instructor-no-courses">
                <div className="instructor-no-courses-icon">
                  <i className="bi bi-journal-x"></i>
                </div>

                <h3>No courses available</h3>

                <p>This instructor has not published any courses yet.</p>
              </div>
            ) : (
              <div className="instructor-course-list">
                {instructor.courses.map((course, index) => (
                  <article key={course.id} className="instructor-course-item">
                    <div className="instructor-course-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="instructor-course-info">
                      <h3>{course.title}</h3>

                      <p>
                        {course.description ||
                          "No course description available."}
                      </p>

                      <div className="instructor-course-meta">
                        <span>
                          <i className="bi bi-tag"></i>
                          {Number(course.price).toLocaleString()} RWF
                        </span>

                        <span>
                          <i className="bi bi-check-circle"></i>
                          Available Course
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="instructor-view-course-btn"
                    >
                      View Course
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetail;
