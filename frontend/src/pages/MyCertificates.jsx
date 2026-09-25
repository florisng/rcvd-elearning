import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/MyCertificates.css";

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/certificates/my-certificates`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load certificates.");
        }

        setCertificates(data.certificates || []);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError(err.message || "Unable to load certificates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const viewCertificate = async (certificateId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/certificates/my-certificates/${certificateId}/view`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to open certificate.");
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);

      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Error viewing certificate:", err);
      alert(err.message || "Unable to open certificate.");
    }
  };

  return (
    <div className="my-certificates">
      <div className="my-certificates-header">
        <div className="my-certificates-header-content">
          <div className="my-certificates-icon">
            <i className="bi bi-award-fill"></i>
          </div>

          <div>
            <span className="my-certificates-label">RCVD E-LEARNING</span>

            <h2>My Certificates</h2>

            <p>
              View and access your certificates for successfully completed
              courses.
            </p>
          </div>
        </div>

        {!loading && !error && certificates.length > 0 && (
          <div className="my-certificates-count">
            <span>Total Certificates</span>
            <strong>{certificates.length}</strong>
          </div>
        )}
      </div>

      {loading && (
        <div className="certificates-state">
          <div className="certificates-spinner"></div>
          <p>Loading your certificates...</p>
        </div>
      )}

      {error && (
        <div className="certificates-message certificates-error">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && certificates.length === 0 && (
        <div className="certificates-empty">
          <div className="certificates-empty-icon">
            <i className="bi bi-award"></i>
          </div>

          <h3>No Certificates Yet</h3>

          <p>
            Your issued certificates will appear here once you successfully
            complete a course and your certificate request is approved.
          </p>
        </div>
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className="certificates-grid">
          {certificates.map((certificate) => (
            <div className="certificate-card" key={certificate.id}>
              <div className="certificate-card-main">
                <div className="certificate-card-icon">
                  <i className="bi bi-award-fill"></i>
                </div>

                <div className="certificate-card-info">
                  <span className="certificate-type">
                    CERTIFICATE OF COMPLETION
                  </span>

                  <h3 className="certificate-course-title">
                    {certificate.course_title}
                  </h3>

                  <div className="certificate-meta">
                    <span>
                      <i className="bi bi-hash"></i>
                      {certificate.certificate_number}
                    </span>

                    <span>
                      <i className="bi bi-calendar3"></i>
                      {new Date(certificate.issued_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>

                    <span className="certificate-status">
                      <i className="bi bi-check-circle-fill"></i>
                      Issued
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="certificate-view-btn"
                  onClick={() => viewCertificate(certificate.id)}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
