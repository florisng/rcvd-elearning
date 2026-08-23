import { useLocation, useNavigate } from "react-router-dom";

function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state;

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

  const formatDuration = (duration) => {
    if (!duration) return "—";

    // PostgreSQL interval returned as an object
    if (typeof duration === "object") {
      const hours = Number(duration.hours || 0);
      const minutes = Number(duration.minutes || 0);
      const seconds = Number(duration.seconds || 0);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }

      return `${minutes}m ${seconds}s`;
    }

    // PostgreSQL interval returned as a string
    const match = String(duration).match(/(?:(\d+):)?(\d+):(\d+)(?:\.(\d+))?/);

    if (!match) return String(duration);

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Result Header */}
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

          {/* Score Summary */}
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
                    <div className="fs-4 fw-bold">{score}</div>
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

          {/* Attempt Information */}
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

          {/* Actions */}
          <div className="text-center">
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
