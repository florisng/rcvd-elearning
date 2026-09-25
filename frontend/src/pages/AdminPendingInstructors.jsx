import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/AdminPendingInstructors.css";

const AdminPendingInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchPendingInstructors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/instructors/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load pending instructors.");
      }

      setInstructors(data.instructors || []);
    } catch (err) {
      console.error("Error fetching pending instructors:", err);
      setError(err.message || "Failed to load pending instructors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInstructors();
  }, []);

  const handleApprove = async (instructorId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/instructors/${instructorId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve instructor.");
      }

      await fetchPendingInstructors();
    } catch (err) {
      setError(err.message || "Failed to approve instructor.");
    }
  };

  const openRejectModal = (instructor) => {
    setSelectedInstructor(instructor);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    if (rejecting) return;

    setShowRejectModal(false);
    setSelectedInstructor(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!selectedInstructor || !rejectionReason.trim()) {
      return;
    }

    try {
      setRejecting(true);

      const response = await fetch(
        `${API_URL}/api/admin/instructors/${selectedInstructor.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: rejectionReason.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject instructor.");
      }

      closeRejectModal();
      await fetchPendingInstructors();
    } catch (err) {
      setError(err.message || "Failed to reject instructor.");
    } finally {
      setRejecting(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <div className="admin-pending-instructors-page">
        <div className="admin-pending-instructors-state">
          <div className="admin-pending-spinner"></div>
          <p>Loading pending instructors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pending-instructors-page">
      <div className="admin-pending-instructors-container">
        <header className="admin-pending-instructors-header">
          <div>
            <span className="admin-pending-instructors-label">
              INSTRUCTOR MANAGEMENT
            </span>

            <h1>Pending Approvals</h1>

            <p>Review instructor applications before approving them.</p>
          </div>

          <button
            type="button"
            className="refresh-pending-instructors-btn"
            onClick={fetchPendingInstructors}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-pending-instructors-error">
            <i className="bi bi-exclamation-circle"></i>

            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <section className="admin-pending-instructors-section">
          <div className="pending-section-heading">
            <div>
              <span className="pending-section-eyebrow">
                PENDING APPLICATIONS
              </span>

              <h2>Instructors to Approve</h2>

              <p>
                These instructors are waiting for RCVD administrator approval.
              </p>
            </div>

            <span className="pending-section-count">{instructors.length}</span>
          </div>

          {instructors.length === 0 ? (
            <div className="admin-pending-instructors-empty">
              <div className="pending-empty-icon">
                <i className="bi bi-person-check"></i>
              </div>

              <h2>No pending applications</h2>

              <p>
                There are currently no instructor applications waiting for
                approval.
              </p>
            </div>
          ) : (
            <div className="pending-instructor-grid">
              {instructors.map((instructor) => (
                <div className="pending-instructor-card" key={instructor.id}>
                  <div className="pending-instructor-top">
                    <div className="pending-instructor-avatar">
                      {getInitials(instructor.first_name, instructor.last_name)}
                    </div>

                    <span className="pending-instructor-badge">
                      <i className="bi bi-clock"></i>
                      Pending
                    </span>
                  </div>

                  <h3>
                    {instructor.first_name} {instructor.last_name}
                  </h3>

                  <p className="pending-instructor-title">
                    {instructor.professional_title ||
                      "Professional title not provided"}
                  </p>

                  <div className="pending-instructor-details">
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

                  <div className="pending-instructor-actions">
                    <button
                      type="button"
                      className="instructor-approve-btn"
                      onClick={() => handleApprove(instructor.id)}
                    >
                      <i className="bi bi-check-circle"></i>
                      Approve
                    </button>

                    <button
                      type="button"
                      className="instructor-reject-btn"
                      onClick={() => openRejectModal(instructor)}
                    >
                      <i className="bi bi-x-circle"></i>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showRejectModal && selectedInstructor && (
        <div className="admin-pending-modal-overlay">
          <div className="admin-pending-reject-modal">
            <button
              type="button"
              className="pending-modal-close"
              onClick={closeRejectModal}
              disabled={rejecting}
            >
              <i className="bi bi-x"></i>
            </button>

            <div className="pending-reject-icon">
              <i className="bi bi-person-x"></i>
            </div>

            <h2>Reject Instructor Application</h2>

            <p>
              Please provide a reason for rejecting the application of{" "}
              <strong>
                {selectedInstructor.first_name} {selectedInstructor.last_name}
              </strong>
              .
            </p>

            <label htmlFor="rejectionReason">Rejection reason</label>

            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              disabled={rejecting}
            />

            <small>This reason will be included in the rejection email.</small>

            <div className="pending-modal-actions">
              <button
                type="button"
                className="pending-modal-cancel"
                onClick={closeRejectModal}
                disabled={rejecting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="pending-modal-confirm"
                onClick={handleReject}
                disabled={rejecting || !rejectionReason.trim()}
              >
                {rejecting ? (
                  <>
                    <span className="pending-button-spinner"></span>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle"></i>
                    Reject Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingInstructors;
