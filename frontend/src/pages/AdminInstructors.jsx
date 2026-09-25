import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/AdminInstructors.css";

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/instructors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load instructors.");
      }

      setInstructors(data.instructors || []);
    } catch (err) {
      console.error("Error fetching instructors:", err);
      setError(err.message || "Failed to load instructors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") {
      return "instructor-status approved";
    }

    return "instructor-status pending";
  };

  if (loading) {
    return (
      <div className="admin-instructors-page">
        <div className="admin-instructors-state">
          <div className="admin-spinner"></div>
          <p>Loading instructors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-instructors-page">
      <div className="admin-instructors-container">
        <header className="admin-instructors-header">
          <div>
            <span className="admin-instructors-label">
              INSTRUCTOR MANAGEMENT
            </span>

            <h1>Instructors</h1>

            <p>
              View all instructors registered on the RCVD E-learning platform.
            </p>
          </div>

          <button
            type="button"
            className="refresh-instructors-btn"
            onClick={fetchInstructors}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-instructors-error">
            <i className="bi bi-exclamation-circle"></i>

            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <section className="admin-instructors-section">
          <div className="instructors-section-heading">
            <div>
              <span className="instructors-section-eyebrow">
                INSTRUCTOR DIRECTORY
              </span>

              <h2>All Instructors</h2>

              <p>All pending and approved instructors on the platform.</p>
            </div>

            <span className="instructors-section-count">
              {instructors.length}
            </span>
          </div>

          {instructors.length === 0 ? (
            <div className="admin-instructors-empty">
              <div className="instructors-empty-icon">
                <i className="bi bi-people"></i>
              </div>

              <h3>No instructors yet</h3>

              <p>
                There are currently no instructors registered on the platform.
              </p>
            </div>
          ) : (
            <div className="approved-instructors-table-wrapper">
              <table className="approved-instructors-table">
                <thead>
                  <tr>
                    <th>INSTRUCTOR</th>
                    <th>PROFESSIONAL TITLE</th>
                    <th>REGISTRATION</th>
                    <th>EMAIL</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {instructors.map((instructor) => (
                    <tr key={instructor.id}>
                      <td>
                        <div className="approved-table-instructor">
                          <div className="approved-table-avatar">
                            {getInitials(
                              instructor.first_name,
                              instructor.last_name,
                            )}
                          </div>

                          <div>
                            <strong>
                              {instructor.first_name} {instructor.last_name}
                            </strong>

                            <span>{instructor.phone || "No phone number"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{instructor.professional_title || "Not provided"}</td>

                      <td>
                        {instructor.rcvd_registration_number || "Not provided"}
                      </td>

                      <td>{instructor.email}</td>

                      <td>
                        <span
                          className={getStatusClass(instructor.approval_status)}
                        >
                          <i
                            className={
                              instructor.approval_status === "APPROVED"
                                ? "bi bi-check-circle-fill"
                                : "bi bi-clock-fill"
                            }
                          ></i>

                          {instructor.approval_status === "APPROVED"
                            ? "Approved"
                            : "Pending"}
                        </span>
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

export default AdminInstructors;
