import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "./css/AdminLearners.css";

const AdminLearners = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/learners`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load learners.");
      }

      setLearners(data.learners || []);
    } catch (err) {
      console.error("Error fetching admin learners:", err);
      setError(err.message || "Failed to load learners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  if (loading) {
    return (
      <div className="admin-learners-page">
        <div className="admin-learners-state">
          <div className="admin-learners-spinner"></div>
          <p>Loading learners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-learners-page">
      <div className="admin-learners-container">
        <header className="admin-learners-header">
          <div>
            <span className="admin-learners-label">LEARNER MANAGEMENT</span>

            <h1>Learners</h1>

            <p>View learners registered on the RCVD E-learning platform.</p>
          </div>

          <button
            type="button"
            className="refresh-learners-btn"
            onClick={fetchLearners}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-learners-error">
            <i className="bi bi-exclamation-circle"></i>

            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <section className="admin-learners-section">
          <div className="learners-section-heading">
            <div>
              <span className="learners-section-eyebrow">
                LEARNER DIRECTORY
              </span>

              <h2>All Learners</h2>

              <p>Learners currently registered on the platform.</p>
            </div>

            <span className="learners-section-count">{learners.length}</span>
          </div>

          {learners.length === 0 ? (
            <div className="admin-learners-empty">
              <div className="admin-learners-empty-icon">
                <i className="bi bi-people"></i>
              </div>

              <h2>No learners yet</h2>

              <p>There are currently no learners registered on the platform.</p>
            </div>
          ) : (
            <div className="admin-learners-table-wrapper">
              <table className="admin-learners-table">
                <thead>
                  <tr>
                    <th>LEARNER</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>EMAIL STATUS</th>
                    <th>REGISTERED</th>
                  </tr>
                </thead>

                <tbody>
                  {learners.map((learner) => (
                    <tr key={learner.id}>
                      <td>
                        <div className="admin-learner-name">
                          <div className="admin-learner-icon">
                            <i className="bi bi-person"></i>
                          </div>

                          <div>
                            <Link
                              to={`/admin/learners/${learner.id}`}
                              className="admin-learner-name-link"
                            >
                              {`${learner.first_name || ""} ${
                                learner.last_name || ""
                              }`.trim() || "Unnamed Learner"}
                            </Link>

                            <span>Learner #{learner.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{learner.email || "—"}</td>

                      <td>{learner.phone || "—"}</td>

                      <td>
                        <span
                          className={
                            learner.email_verified
                              ? "learner-email-status verified"
                              : "learner-email-status pending"
                          }
                        >
                          <i
                            className={
                              learner.email_verified
                                ? "bi bi-check-circle-fill"
                                : "bi bi-clock-fill"
                            }
                          ></i>

                          {learner.email_verified ? "Verified" : "Not verified"}
                        </span>
                      </td>

                      <td>
                        {learner.created_at
                          ? new Date(learner.created_at).toLocaleDateString()
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

export default AdminLearners;
