import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../api";
import "./css/VerifyCertificate.css";

const VerifyCertificate = () => {
  const { certificateNumber } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/certificates/verify/${certificateNumber}`,
        );

        const data = await response.json();

        if (!response.ok || !data.valid) {
          setError(data.message || "Certificate not found.");
          return;
        }

        setCertificate(data.certificate);
      } catch (err) {
        console.error("Certificate verification error:", err);
        setError("Unable to verify certificate.");
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateNumber]);

  if (loading) {
    return (
      <div className="verify-certificate-page">
        <div className="verify-certificate-card">
          <p>Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verify-certificate-page">
        <div className="verify-certificate-card verify-invalid">
          <div className="verify-icon">
            <i className="bi bi-x-circle-fill"></i>
          </div>

          <h1>Certificate Not Found</h1>

          <p>{error}</p>

          <div className="verify-number">
            Certificate Number: <strong>{certificateNumber}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-certificate-page">
      <div className="verify-certificate-card verify-valid">
        <div className="verify-icon">
          <i className="bi bi-patch-check-fill"></i>
        </div>

        <span className="verify-label">RCVD E-LEARNING</span>

        <h1>Certificate Verified</h1>

        <p className="verify-message">
          This certificate has been successfully verified and is officially
          recorded in the RCVD E-Learning system.
        </p>

        <div className="verify-details">
          <div className="verify-detail">
            <span>Certificate Number</span>
            <strong>{certificate.certificate_number}</strong>
          </div>

          <div className="verify-detail">
            <span>Learner</span>
            <strong>{certificate.learner_name}</strong>
          </div>

          <div className="verify-detail">
            <span>Professional Title</span>
            <strong>{certificate.professional_title || "—"}</strong>
          </div>

          <div className="verify-detail">
            <span>Course</span>
            <strong>{certificate.course_title}</strong>
          </div>

          <div className="verify-detail">
            <span>Instructor</span>
            <strong>{certificate.instructor_name}</strong>
          </div>

          <div className="verify-detail">
            <span>Issued Date</span>
            <strong>
              {new Date(certificate.issued_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

        <div className="verify-status">
          <i className="bi bi-shield-check"></i>
          Authentic Certificate
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
