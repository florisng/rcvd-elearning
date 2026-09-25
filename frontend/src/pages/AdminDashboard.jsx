import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "./css/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load dashboard data.");
      }

      const paymentsResponse = await fetch(
        `${API_URL}/api/admin/certificate-payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const paymentsData = await paymentsResponse.json();

      if (!paymentsResponse.ok) {
        throw new Error(
          paymentsData.error || "Failed to load certificate payments.",
        );
      }

      setStats({
        ...data,
        certificatePayments: paymentsData.total || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          <Link to="/admin/learners" className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-people"></i>
            </div>
            <div>
              <span>Total Learners</span>
              <strong>{stats?.users?.total_learners || 0}</strong>
            </div>
          </Link>

          <Link to="/admin/instructors" className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-person-workspace"></i>
            </div>
            <div>
              <span>Total Instructors</span>
              <strong>{stats?.users?.total_instructors || 0}</strong>
            </div>
          </Link>

          <Link
            to="/admin/instructors/pending"
            className="admin-stat-card pending-stat-card"
          >
            <div className="admin-stat-icon">
              <i className="bi bi-person-check"></i>
            </div>
            <div>
              <span>Pending Approvals</span>
              <strong>{stats?.users?.pending_instructors || 0}</strong>
            </div>
          </Link>

          <Link to="/admin/instructors/approved" className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-person-check-fill"></i>
            </div>
            <div>
              <span>Approved Instructors</span>
              <strong>{stats?.users?.approved_instructors || 0}</strong>
            </div>
          </Link>

          <Link to="/admin/courses" className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-journal-richtext"></i>
            </div>
            <div>
              <span>Total Courses</span>
              <strong>{stats?.courses?.total_courses || 0}</strong>
            </div>
          </Link>

          <Link to="/admin/courses" className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-journal-check"></i>
            </div>
            <div>
              <span>Published Courses</span>
              <strong>{stats?.courses?.published_courses || 0}</strong>
            </div>
          </Link>

          <Link to="/admin/certificate-payments" className="admin-stat-card">
            <div className="admin-stat-icon">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div>
              <span>Certificate Payments</span>
              <strong>{stats?.certificatePayments || 0}</strong>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
