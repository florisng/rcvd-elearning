import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/InstructorCertificateRequests.css";

const InstructorCertificateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/certificates/instructor/requests`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch certificate requests.");
        }

        const data = await response.json();

        setRequests(data.requests || []);
      } catch (err) {
        console.error("Error fetching certificate requests:", err);
        setError("Unable to load certificate requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const approveCertificate = async (requestId) => {
    try {
      setApprovingId(requestId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/certificates/request/${requestId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve certificate.");
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                certificate_status: "ISSUED",
                issued_at: new Date().toISOString(),
              }
            : request,
        ),
      );
    } catch (err) {
      console.error("Error approving certificate:", err);
      setError(err.message || "Unable to approve certificate.");
    } finally {
      setApprovingId(null);
    }
  };

  const pendingCount = requests.filter(
    (request) => request.certificate_status === "PENDING",
  ).length;

  const issuedCount = requests.filter(
    (request) => request.certificate_status === "ISSUED",
  ).length;

  return (
    <div className="instructor-certificate-requests">
      <div className="certificate-page-header">
        <div>
          <div className="certificate-page-icon">
            <i className="bi bi-award-fill"></i>
          </div>

          <h2>Certificate Requests</h2>

          <p>
            Review and approve certificate requests from learners who have
            completed your courses.
          </p>
        </div>
      </div>

      {error && (
        <div className="certificate-error">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="certificate-summary">
          <div className="certificate-summary-card">
            <div className="certificate-summary-icon pending">
              <i className="bi bi-hourglass-split"></i>
            </div>

            <div>
              <span>Pending Requests</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="certificate-summary-card">
            <div className="certificate-summary-icon issued">
              <i className="bi bi-check-circle-fill"></i>
            </div>

            <div>
              <span>Certificates Issued</span>
              <strong>{issuedCount}</strong>
            </div>
          </div>

          <div className="certificate-summary-card">
            <div className="certificate-summary-icon total">
              <i className="bi bi-award-fill"></i>
            </div>

            <div>
              <span>Total Requests</span>
              <strong>{requests.length}</strong>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="certificate-loading">
          <div className="certificate-loading-spinner"></div>
          <p>Loading certificate requests...</p>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="certificate-empty">
          <div className="certificate-empty-icon">
            <i className="bi bi-award"></i>
          </div>

          <h3>No Certificate Requests</h3>

          <p>
            Certificate requests from learners will appear here once they
            complete your courses.
          </p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="certificate-table-container">
          <div className="certificate-table-header">
            <div>
              <h3>Recent Requests</h3>
              <p>Certificate requests from your learners</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="certificate-requests-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Requested</th>
                  <th>Issued</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="certificate-learner">
                        <div className="certificate-learner-avatar">
                          {request.learner_first_name?.charAt(0)}
                          {request.learner_last_name?.charAt(0)}
                        </div>

                        <div>
                          <div className="certificate-learner-name">
                            {request.learner_first_name}{" "}
                            {request.learner_last_name}
                          </div>

                          <div className="certificate-learner-email">
                            {request.learner_email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="certificate-course">
                        {request.course_title}
                      </div>
                    </td>

                    <td>
                      <span className="certificate-amount">
                        {Number(request.amount).toLocaleString()} RWF
                      </span>
                    </td>

                    <td>
                      <span className="certificate-date">
                        <i className="bi bi-calendar3"></i>
                        {new Date(request.requested_at).toLocaleDateString(
                          "en-GB",
                        )}
                      </span>
                    </td>

                    <td>
                      {request.issued_at ? (
                        <span className="certificate-date">
                          <i className="bi bi-check2"></i>
                          {new Date(request.issued_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      ) : (
                        <span className="certificate-not-issued">—</span>
                      )}
                    </td>

                    <td>
                      {request.certificate_status === "PENDING" ? (
                        <button
                          className="certificate-approve-btn"
                          onClick={() => approveCertificate(request.id)}
                          disabled={approvingId === request.id}
                        >
                          <i
                            className={
                              approvingId === request.id
                                ? "bi bi-hourglass-split"
                                : "bi bi-check2-circle"
                            }
                          ></i>

                          {approvingId === request.id
                            ? "Approving..."
                            : "Approve"}
                        </button>
                      ) : (
                        <span className="certificate-issued-label">
                          <i className="bi bi-check-circle-fill"></i>
                          Issued
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCertificateRequests;
