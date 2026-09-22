import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [approvedInstructors, setApprovedInstructors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, pendingResponse, approvedResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { headers }),
          fetch(`${API_URL}/api/admin/instructors/pending`, { headers }),
          fetch(`${API_URL}/api/admin/instructors/approved`, { headers }),
        ]);

      const statsData = await statsResponse.json();
      const pendingData = await pendingResponse.json();
      const approvedData = await approvedResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsData.error || "Failed to load dashboard statistics.",
        );
      }

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.error || "Failed to load pending instructors.",
        );
      }

      if (!approvedResponse.ok) {
        throw new Error(
          approvedData.error || "Failed to load approved instructors.",
        );
      }

      setStats(statsData);
      setPendingInstructors(pendingData.instructors || []);
      setApprovedInstructors(approvedData.instructors || []);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      setError(err.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

      await fetchDashboardData();
    } catch (err) {
      console.error("Error approving instructor:", err);
      setError(err.message);
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
    if (!selectedInstructor) return;

    if (!rejectionReason.trim()) {
      return;
    }

    try {
      setRejecting(true);

      const response = await fetch(
        `${API_URL}/api/admin/instructors/${selectedInstructor.id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

      setShowRejectModal(false);
      setSelectedInstructor(null);
      setRejectionReason("");

      await fetchDashboardData();
    } catch (err) {
      console.error("Error rejecting instructor:", err);
      setError(err.message);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-state">
        <div className="admin-spinner"></div>
        <p>Loading administration dashboard...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-dashboard-state error-state">
        <div className="state-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
        <button
          type="button"
          className="admin-retry-btn"
          onClick={fetchDashboardData}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        {/* Dashboard Header */}
        <div className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-label">
              RCVD E-LEARNING ADMINISTRATION
            </span>

            <h1>Administration Dashboard</h1>

            <p>
              Manage instructors, learners, courses and platform activity from
              one place.
            </p>
          </div>

          <button
            type="button"
            className="refresh-dashboard-btn"
            onClick={fetchDashboardData}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="admin-error-banner">
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>

            <button type="button" onClick={() => setError("")}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-people"></i>
            </div>

            <div>
              <span>Total Learners</span>
              <strong>{stats?.users?.total_learners || 0}</strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-person-workspace"></i>
            </div>

            <div>
              <span>Total Instructors</span>
              <strong>{stats?.users?.total_instructors || 0}</strong>
            </div>
          </div>

          <div className="admin-stat-card pending-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-person-check"></i>
            </div>

            <div>
              <span>Pending Approvals</span>
              <strong>{stats?.users?.pending_instructors || 0}</strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-person-check-fill"></i>
            </div>

            <div>
              <span>Approved Instructors</span>
              <strong>{stats?.users?.approved_instructors || 0}</strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-journal-richtext"></i>
            </div>

            <div>
              <span>Total Courses</span>
              <strong>{stats?.courses?.total_courses || 0}</strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-journal-check"></i>
            </div>

            <div>
              <span>Published Courses</span>
              <strong>{stats?.courses?.published_courses || 0}</strong>
            </div>
          </div>
        </section>

        {/* Pending Instructors */}
        <section className="admin-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">INSTRUCTOR MANAGEMENT</span>
              <h2>Instructors to Approve</h2>
              <p>Review instructor applications and approve or reject them.</p>
            </div>

            <span className="section-count">{pendingInstructors.length}</span>
          </div>

          {pendingInstructors.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">
                <i className="bi bi-person-check"></i>
              </div>

              <h3>No pending applications</h3>

              <p>There are currently no instructors waiting for approval.</p>
            </div>
          ) : (
            <div className="instructor-grid">
              {pendingInstructors.map((instructor) => (
                <div className="instructor-card" key={instructor.id}>
                  <div className="instructor-card-top">
                    <div className="instructor-avatar">
                      {instructor.first_name?.charAt(0)}
                      {instructor.last_name?.charAt(0)}
                    </div>

                    <span className="pending-badge">
                      <i className="bi bi-clock"></i>
                      Pending
                    </span>
                  </div>

                  <h3>
                    {instructor.first_name} {instructor.last_name}
                  </h3>

                  <p className="instructor-title">
                    {instructor.professional_title ||
                      "Professional title not provided"}
                  </p>

                  <div className="instructor-details">
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
                        {instructor.rcvd_registration_number || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="instructor-card-actions">
                    <button
                      type="button"
                      className="approve-btn"
                      onClick={() => handleApprove(instructor.id)}
                    >
                      <i className="bi bi-check-circle"></i>
                      Approve
                    </button>

                    <button
                      type="button"
                      className="reject-btn"
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

        {/* Approved Instructors */}
        <section className="admin-section approved-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">INSTRUCTOR DIRECTORY</span>
              <h2>Approved Instructors</h2>
              <p>
                Instructors who have been approved to use the RCVD E-learning
                platform.
              </p>
            </div>

            <span className="section-count">{approvedInstructors.length}</span>
          </div>

          {approvedInstructors.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">
                <i className="bi bi-people"></i>
              </div>

              <h3>No approved instructors yet</h3>

              <p>Approved instructors will appear here.</p>
            </div>
          ) : (
            <div className="approved-instructors-table-wrapper">
              <table className="approved-instructors-table">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Professional Title</th>
                    <th>Registration</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {approvedInstructors.map((instructor) => (
                    <tr key={instructor.id}>
                      <td>
                        <div className="table-instructor">
                          <div className="table-avatar">
                            {instructor.first_name?.charAt(0)}
                            {instructor.last_name?.charAt(0)}
                          </div>

                          <div>
                            <strong>
                              {instructor.first_name} {instructor.last_name}
                            </strong>

                            <span>{instructor.phone || "No phone"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{instructor.professional_title || "Not provided"}</td>

                      <td>
                        {instructor.rcvd_registration_number || "Not provided"}
                      </td>

                      <td>{instructor.email}</td>

                      <td>
                        <span className="approved-badge">
                          <i className="bi bi-check-circle-fill"></i>
                          Approved
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

      {/* Rejection Modal */}
      {showRejectModal && selectedInstructor && (
        <div className="admin-modal-overlay">
          <div className="admin-reject-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeRejectModal}
              disabled={rejecting}
            >
              <i className="bi bi-x"></i>
            </button>

            <div className="reject-modal-icon">
              <i className="bi bi-person-x"></i>
            </div>

            <h2>Reject Instructor Application</h2>

            <p>
              You are rejecting the application of{" "}
              <strong>
                {selectedInstructor.first_name} {selectedInstructor.last_name}
              </strong>
              .
            </p>

            <label htmlFor="rejectionReason">Reason for rejection</label>

            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this instructor application is being rejected..."
              rows="5"
              disabled={rejecting}
            />

            <small>This reason will be sent to the instructor by email.</small>

            <div className="reject-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={closeRejectModal}
                disabled={rejecting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-confirm-reject-btn"
                onClick={handleReject}
                disabled={rejecting || !rejectionReason.trim()}
              >
                {rejecting ? (
                  <>
                    <span className="button-spinner"></span>
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

export default AdminDashboard;
