import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import "./css/AdminCertificatePayments.css";

const AdminCertificatePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/certificate-payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load certificate payments.");
      }

      setPayments(data.payments || []);
    } catch (err) {
      console.error("Error fetching certificate payments:", err);
      setError(err.message || "Failed to load certificate payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatAmount = (amount) => {
    return `${Number(amount || 0).toLocaleString()} RWF`;
  };

  const getFullName = (firstName, lastName) => {
    return `${firstName || ""} ${lastName || ""}`.trim();
  };

  const toggleRcvdPaymentStatus = async (requestId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/certificate-payments/${requestId}/rcvd-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update RCVD payment status.");
      }

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === requestId
            ? {
                ...payment,
                rcvd_payment_status: data.payment.rcvd_payment_status,
              }
            : payment,
        ),
      );
    } catch (err) {
      console.error("Error updating RCVD payment status:", err);
      setError(err.message || "Failed to update RCVD payment status.");
    }
  };

  if (loading) {
    return (
      <div className="admin-payment-state">
        <div className="admin-payment-spinner"></div>
        <p>Loading certificate payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-payment-state error-state">
        <div className="state-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </div>

        <h3>Unable to load payments</h3>
        <p>{error}</p>

        <button
          type="button"
          className="admin-payment-retry-btn"
          onClick={fetchPayments}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="admin-certificate-payments">
      <div className="admin-certificate-payments-container">
        <div className="admin-certificate-payments-header">
          <div>
            <span className="admin-certificate-payments-label">
              RCVD E-LEARNING
            </span>

            <h1>Certificate Payments</h1>

            <p>
              Track certificate payments and the distribution between
              instructors and RCVD.
            </p>
          </div>

          <button
            type="button"
            className="refresh-payment-btn"
            onClick={fetchPayments}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>

        <div className="payment-summary-card">
          <div className="payment-summary-icon">
            <i className="bi bi-cash-stack"></i>
          </div>

          <div>
            <span>Total Certificate Requests</span>
            <strong>{payments.length}</strong>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="empty-payment-state">
            <div className="empty-payment-icon">
              <i className="bi bi-receipt"></i>
            </div>

            <h3>No Certificate Payments</h3>
            <p>
              Certificate payment records will appear here when learners request
              certificates.
            </p>
          </div>
        ) : (
          <div className="payments-table-card">
            <div className="table-responsive">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Certificate Fee</th>
                    <th>Instructor 90%</th>
                    <th>RCVD 10%</th>
                    <th>RCVD Share</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {getFullName(
                          payment.instructor_first_name,
                          payment.instructor_last_name,
                        )}
                      </td>

                      <td>
                        <strong>{formatAmount(payment.amount)}</strong>
                      </td>

                      <td>{formatAmount(payment.instructor_amount)}</td>

                      <td>{formatAmount(payment.rcvd_amount)}</td>
                      <td>
                        <span
                          className={`payment-status ${
                            payment.rcvd_payment_status === "PAID"
                              ? "paid"
                              : "pending"
                          }`}
                        >
                          <i
                            className={
                              payment.rcvd_payment_status === "PAID"
                                ? "bi bi-check-circle-fill"
                                : "bi bi-clock-fill"
                            }
                          ></i>

                          {payment.rcvd_payment_status}
                        </span>
                      </td>

                      <td>
                        {payment.issued_at
                          ? new Date(payment.issued_at).toLocaleDateString(
                              "en-GB",
                            )
                          : new Date(payment.requested_at).toLocaleDateString(
                              "en-GB",
                            )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`rcvd-payment-action-btn ${
                            payment.rcvd_payment_status === "PAID"
                              ? "mark-pending"
                              : "mark-paid"
                          }`}
                          onClick={() => toggleRcvdPaymentStatus(payment.id)}
                        >
                          <i
                            className={
                              payment.rcvd_payment_status === "PAID"
                                ? "bi bi-arrow-counterclockwise"
                                : "bi bi-check-circle"
                            }
                          ></i>

                          {payment.rcvd_payment_status === "PAID"
                            ? "Mark Pending"
                            : "Mark Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="payment-page-back">
          <Link to="/admin/dashboard">
            <i className="bi bi-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificatePayments;
