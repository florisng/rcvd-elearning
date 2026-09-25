import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/AdminApprovedInstructors.css";

const AdminApprovedInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchApprovedInstructors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/instructors/approved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load approved instructors.");
      }

      setInstructors(data.instructors || []);
    } catch (err) {
      console.error("Error fetching approved instructors:", err);
      setError(err.message || "Failed to load approved instructors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedInstructors();
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <div className="admin-approved-instructors-page">
        <div className="admin-approved-instructors-state">
          <div className="admin-approved-spinner"></div>
          <p>Loading approved instructors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-approved-instructors-page">
      <div className="admin-approved-instructors-container">
        <header className="admin-approved-instructors-header">
          <div>
            <span className="admin-approved-instructors-label">
              INSTRUCTOR MANAGEMENT
            </span>

            <h1>Approved Instructors</h1>

            <p>
              View instructors who have been approved by an RCVD administrator.
            </p>
          </div>

          <button
            type="button"
            className="refresh-approved-instructors-btn"
            onClick={fetchApprovedInstructors}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-approved-instructors-error">
            <i className="bi bi-exclamation-circle"></i>

            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <section className="admin-approved-instructors-section">
          <div className="approved-section-heading">
            <div>
              <span className="approved-section-eyebrow">
                APPROVED INSTRUCTORS
              </span>

              <h2>Instructor Directory</h2>

              <p>
                These instructors are approved to provide courses on the RCVD
                E-learning platform.
              </p>
            </div>

            <span className="approved-section-count">{instructors.length}</span>
          </div>

          {instructors.length === 0 ? (
            <div className="admin-approved-instructors-empty">
              <div className="approved-empty-icon">
                <i className="bi bi-people"></i>
              </div>

              <h2>No approved instructors</h2>

              <p>
                There are currently no approved instructors on the platform.
              </p>
            </div>
          ) : (
            <div className="approved-instructor-grid">
              {instructors.map((instructor) => (
                <div className="approved-instructor-card" key={instructor.id}>
                  <div className="approved-instructor-top">
                    <div className="approved-instructor-avatar">
                      {getInitials(instructor.first_name, instructor.last_name)}
                    </div>

                    <span className="approved-instructor-badge">
                      <i className="bi bi-check-circle-fill"></i>
                      Approved
                    </span>
                  </div>

                  <h3>
                    {instructor.first_name} {instructor.last_name}
                  </h3>

                  <p className="approved-instructor-title">
                    {instructor.professional_title ||
                      "Professional title not provided"}
                  </p>

                  <div className="approved-instructor-details">
                    <div>
                      <i className="bi bi-envelope"></i>
                      <span>{instructor.email}</span>
                    </div>

                    <div>
                      <i className="bi bi-telephone"></i>
                      <span>{instructor.phone || "Not provided"}</span>
                    </div>

                    <div>
                      <i className="bi bi-card-text"></i>
                      <span>
                        {instructor.rcvd_registration_number ||
                          "Registration number not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminApprovedInstructors;
