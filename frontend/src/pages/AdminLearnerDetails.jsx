import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../api";
import "./css/AdminLearnerDetails.css";

const AdminLearnerDetails = () => {
  const { id } = useParams();

  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/learners/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load learner.");
        }

        setLearner(data.learner);
      } catch (err) {
        console.error("Error fetching learner:", err);
        setError(err.message || "Failed to load learner.");
      } finally {
        setLoading(false);
      }
    };

    fetchLearner();
  }, [id, token]);

  if (loading) {
    return (
      <div className="admin-learner-details-page">
        <div className="admin-learner-details-state">
          <div className="admin-learner-details-spinner"></div>
          <p>Loading learner...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-learner-details-page">
        <div className="admin-learner-details-error">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>

        <Link to="/admin/learners" className="admin-learner-back-link">
          <i className="bi bi-arrow-left"></i>
          Back to Learners
        </Link>
      </div>
    );
  }

  if (!learner) {
    return null;
  }

  return (
    <div className="admin-learner-details-page">
      <div className="admin-learner-details-container">
        <Link to="/admin/learners" className="admin-learner-back-link">
          <i className="bi bi-arrow-left"></i>
          Back to Learners
        </Link>

        <header className="admin-learner-details-header">
          <div>
            <span className="admin-learner-details-label">
              LEARNER MANAGEMENT
            </span>

            <h1>
              {`${learner.first_name || ""} ${
                learner.last_name || ""
              }`.trim() || "Learner"}
            </h1>

            <p>Learner #{learner.id}</p>
          </div>
        </header>

        <section className="admin-learner-profile-card">
          <div className="admin-learner-profile-icon">
            <i className="bi bi-person"></i>
          </div>

          <div className="admin-learner-profile-info">
            <h2>
              {`${learner.first_name || ""} ${
                learner.last_name || ""
              }`.trim() || "Unnamed Learner"}
            </h2>

            <p>{learner.email || "No email"}</p>
          </div>
        </section>

        <section className="admin-learner-info-section">
          <h2>Learner Information</h2>

          <div className="admin-learner-info-grid">
            <div>
              <span>First Name</span>
              <strong>{learner.first_name || "—"}</strong>
            </div>

            <div>
              <span>Last Name</span>
              <strong>{learner.last_name || "—"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{learner.email || "—"}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{learner.phone || "—"}</strong>
            </div>

            <div>
              <span>Email Status</span>
              <strong>
                {learner.email_verified ? "Verified" : "Not verified"}
              </strong>
            </div>

            <div>
              <span>Registered</span>
              <strong>
                {learner.created_at
                  ? new Date(learner.created_at).toLocaleDateString()
                  : "—"}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLearnerDetails;
