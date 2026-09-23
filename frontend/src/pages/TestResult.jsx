import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTestResult } from "../services/testService";

import {
  getMyCertificateRequest,
  requestCertificate,
} from "../services/certificateService";

function TestResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [certificateRequest, setCertificateRequest] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  const formatDuration = (duration) => {
    if (!duration) return "—";

    if (typeof duration === "object") {
      const hours = Number(duration.hours || 0);
      const minutes = Number(duration.minutes || 0);
      const seconds = Number(duration.seconds || 0);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }

      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }

      return `${seconds}s`;
    }

    return String(duration);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
  };

  const loadCertificateRequest = async (courseId) => {
    if (!courseId) return;

    try {
      const data = await getMyCertificateRequest(courseId, token);
      setCertificateRequest(data.request || null);
    } catch (err) {
      console.error("Error loading certificate request:", err);
    }
  };

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await getTestResult(attemptId, token);

        if (!data.result) {
          setError("Test result not found.");
          return;
        }

        setResult(data.result);

        if (data.result.passed && data.result.course_id) {
          await loadCertificateRequest(data.result.course_id);
        }
      } catch (err) {
        console.error("Error loading test result:", err);

        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load test result.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId, token]);

  const handleRequestCertificate = async () => {
    const courseId = result?.course_id;

    if (!courseId) {
      setError("Course ID could not be determined.");
      return;
    }

    setCertificateLoading(true);
    setError("");

    try {
      const data = await requestCertificate(courseId, token);

      setCertificateRequest(data.request || null);
    } catch (err) {
      console.error("Error requesting certificate:", err);

      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to request certificate.",
      );
    } finally {
      setCertificateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="text-muted mt-3">Loading test result...</p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/learner/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Test result not found.</div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/learner/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const {
    attempt_id,
    total_questions,
    answered_questions,
    correct_answers,
    incorrect_answers,
    percentage,
    pass_percentage,
    passed,
    submitted_at,
    score,
    actual_duration,
  } = result;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body text-center py-5">
              <div
                className={`display-5 fw-bold mb-3 ${
                  passed ? "text-success" : "text-danger"
                }`}
              >
                {passed ? "Test Passed!" : "Test Failed"}
              </div>

              <div className="display-3 fw-bold mb-2">{percentage}%</div>

              <p className="text-muted mb-0">
                Passing score: {pass_percentage}%
              </p>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h4 className="mb-4">Result Summary</h4>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="bg-light rounded p-3 text-center">
                    <div className="text-muted small">Total Questions</div>
                    <div className="fs-4 fw-bold">{total_questions}</div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="bg-light rounded p-3 text-center">
                    <div className="text-muted small">Answered</div>
                    <div className="fs-4 fw-bold">{answered_questions}</div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="bg-light rounded p-3 text-center">
                    <div className="text-muted small">Score</div>
                    <div className="fs-4 fw-bold">{score}%</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bg-success bg-opacity-10 rounded p-3 text-center">
                    <div className="text-success small">Correct Answers</div>

                    <div className="fs-4 fw-bold text-success">
                      {correct_answers}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bg-danger bg-opacity-10 rounded p-3 text-center">
                    <div className="text-danger small">Incorrect Answers</div>

                    <div className="fs-4 fw-bold text-danger">
                      {incorrect_answers}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h4 className="mb-4">Attempt Information</h4>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Attempt ID</div>
                  <div className="fw-semibold">#{attempt_id}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Time Taken</div>
                  <div className="fw-semibold">
                    {formatDuration(actual_duration)}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small">Submitted</div>
                  <div className="fw-semibold">{formatDate(submitted_at)}</div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small">Status</div>

                  <div>
                    <span
                      className={`badge ${passed ? "bg-success" : "bg-danger"}`}
                    >
                      {passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            {passed && !certificateRequest && (
              <button
                className="btn btn-success px-4 me-2"
                disabled={certificateLoading}
                onClick={handleRequestCertificate}
              >
                {certificateLoading ? "Requesting..." : "Request Certificate"}
              </button>
            )}

            {passed && certificateRequest && (
              <div className="alert alert-info mb-3">
                Certificate request submitted successfully.
                <br />
                <strong>Status:</strong> {certificateRequest.certificate_status}
              </div>
            )}

            <button
              className="btn btn-primary px-4 me-2"
              onClick={() => navigate("/learner/dashboard")}
            >
              Back to Dashboard
            </button>

            <button
              className="btn btn-outline-secondary px-4"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResult;
