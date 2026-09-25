import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  startTest as startTestApi,
  resumeTest,
  saveAnswer,
  submitTest,
  getTestAttempts,
  getTestResult,
} from "../services/testService";

import { requestCertificate } from "../services/certificateService";

function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [test, setTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [courseId, setCourseId] = useState(null);
  const [certificateRequest, setCertificateRequest] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const formatDuration = (duration) => {
    if (!duration) return "—";

    if (typeof duration === "object") {
      const seconds = Number(duration.seconds || 0);
      const milliseconds = Number(duration.milliseconds || 0);

      const totalSeconds = Math.floor(seconds + milliseconds / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;

      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }

      return `${remainingSeconds}s`;
    }

    return String(duration);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  const loadCertificateRequest = async (id) => {
    if (!id) {
      setCertificateRequest(null);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/certificates/request/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 404) {
        setCertificateRequest(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load certificate request.");
      }

      setCertificateRequest(data.request || null);
    } catch (err) {
      console.error("Error loading certificate request:", err);
      setCertificateRequest(null);
    }
  };

  const loadAttempts = async () => {
    const data = await getTestAttempts(testId, token);

    const loadedTest = data.test || null;
    const loadedAttempts = data.attempts || [];

    setTest(loadedTest);
    setAttempts(loadedAttempts);

    const detectedCourseId = Number(loadedTest?.course_id);

    if (Number.isInteger(detectedCourseId) && detectedCourseId > 0) {
      setCourseId(detectedCourseId);
      await loadCertificateRequest(detectedCourseId);
    } else {
      setCourseId(null);
      setCertificateRequest(null);
    }

    const passedAttempt = loadedAttempts.find((item) => item.passed === true);

    if (passedAttempt) {
      try {
        const resultData = await getTestResult(passedAttempt.id, token);

        setResult(resultData.result || null);
      } catch (err) {
        console.error("Error loading test result:", err);
      }
    } else {
      setResult(null);
    }
  };

  const startTest = async () => {
    setStarting(true);
    setError("");

    try {
      const data = await startTestApi(testId, token);

      setAttempt(data.attempt);
      setQuestions(data.questions || []);

      const detectedCourseId = Number(data.test?.course_id);

      if (Number.isInteger(detectedCourseId) && detectedCourseId > 0) {
        setCourseId(detectedCourseId);
      }

      const existingAnswers = {};

      (data.answers || []).forEach((answer) => {
        existingAnswers[answer.question_id] = answer.option_id;
      });

      setAnswers(existingAnswers);
    } catch (err) {
      console.error("Error starting test:", err);

      setError(
        err.response?.data?.error || err.message || "Failed to start test.",
      );
    } finally {
      setStarting(false);
    }
  };

  const resumeExistingTest = async (attemptId) => {
    setError("");
    setStarting(true);

    try {
      const data = await resumeTest(attemptId, token);

      setAttempt(data.attempt);
      setQuestions(data.questions || []);

      const detectedCourseId = Number(data.test?.course_id);

      if (Number.isInteger(detectedCourseId) && detectedCourseId > 0) {
        setCourseId(detectedCourseId);
      }

      const existingAnswers = {};

      (data.answers || []).forEach((answer) => {
        existingAnswers[answer.question_id] = answer.option_id;
      });

      setAnswers(existingAnswers);
    } catch (err) {
      console.error("Error resuming test:", err);

      setError(
        err.response?.data?.error || err.message || "Failed to resume test.",
      );
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitTest = async () => {
    const unansweredQuestions = questions.filter(
      (question) => !answers[question.question_id],
    );

    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`,
      );

      if (!confirmSubmit) {
        return;
      }
    }

    setStarting(true);
    setError("");

    try {
      const submissionData = await submitTest(attempt.id, answers, token);
      const submittedResult = submissionData?.result;

      if (!submittedResult) {
        throw new Error("Test result was not returned by the server.");
      }

      setResult(submittedResult);

      const resultCourseId = Number(
        submittedResult.course_id || test?.course_id || courseId || 0,
      );

      if (Number.isInteger(resultCourseId) && resultCourseId > 0) {
        setCourseId(resultCourseId);
      }

      if (
        submittedResult.passed &&
        Number.isInteger(resultCourseId) &&
        resultCourseId > 0
      ) {
        await loadCertificateRequest(resultCourseId);
      }

      const attemptsData = await getTestAttempts(testId, token);

      setTest(attemptsData.test || test);
      setAttempts(attemptsData.attempts || []);

      setAttempt(null);
      setQuestions([]);
      setAnswers({});
    } catch (err) {
      console.error("Error submitting test:", err);

      setError(
        err.response?.data?.error || err.message || "Failed to submit test.",
      );
    } finally {
      setStarting(false);
    }
  };

  const handleRequestCertificate = async () => {
    setCertificateLoading(true);
    setError("");

    try {
      let id = Number(test?.course_id || courseId || 0);

      /*
       * If the course ID is not currently available in state,
       * refresh the test information from the backend.
       */
      if (!Number.isInteger(id) || id <= 0) {
        const data = await getTestAttempts(testId, token);

        const refreshedTest = data.test || null;
        const refreshedCourseId = Number(refreshedTest?.course_id);

        if (
          refreshedTest &&
          Number.isInteger(refreshedCourseId) &&
          refreshedCourseId > 0
        ) {
          setTest(refreshedTest);
          setAttempts(data.attempts || []);
          setCourseId(refreshedCourseId);

          id = refreshedCourseId;
        }
      }

      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("The course linked to this test could not be found.");
      }

      const certificateData = await requestCertificate(id, token);

      setCertificateRequest(certificateData.request || null);
      setCourseId(id);
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

  useEffect(() => {
    const loadTest = async () => {
      try {
        await loadAttempts();
      } catch (err) {
        console.error("Error loading test:", err);

        setError(err.message || "Failed to load test.");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (attempt) {
    return (
      <div className="container py-5">
        <h2>{test.title}</h2>

        <div className="mb-4">
          Attempt {attempt.attempt_number} · {questions.length} questions
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {questions.map((question, index) => (
          <div className="card mb-4" key={question.question_id}>
            <div className="card-body">
              <h5>
                {index + 1}. {question.question_text}
              </h5>

              {question.options.map((option) => (
                <div className="form-check mb-2" key={option.option_id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`question-${question.question_id}`}
                    id={`option-${option.option_id}`}
                    checked={answers[question.question_id] === option.option_id}
                    onChange={async () => {
                      const questionId = question.question_id;
                      const optionId = option.option_id;

                      setAnswers((previous) => ({
                        ...previous,
                        [questionId]: optionId,
                      }));

                      try {
                        await saveAnswer(
                          attempt.id,
                          questionId,
                          optionId,
                          token,
                        );
                      } catch (err) {
                        console.error("Error saving answer:", err);

                        setError(
                          err.response?.data?.error ||
                            err.message ||
                            "Failed to save answer.",
                        );
                      }
                    }}
                  />

                  <label
                    className="form-check-label"
                    htmlFor={`option-${option.option_id}`}
                  >
                    {option.option_text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="alert alert-info mb-0">
            Your answers are saved automatically.
          </div>

          <button
            className="btn btn-success px-4"
            onClick={handleSubmitTest}
            disabled={starting}
          >
            {starting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>
    );
  }

  const inProgressAttempt = attempts.find(
    (item) => item.status === "IN_PROGRESS",
  );

  const hasPassed = attempts.some((item) => item.passed === true);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h2 className="mb-2">{test.title}</h2>

              <p className="text-muted mb-0">
                Maximum attempts per cycle: {test.max_attempts}
              </p>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {result && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body text-center">
                <h3 className={result.passed ? "text-success" : "text-danger"}>
                  {result.passed ? "Test Passed!" : "Test Failed"}
                </h3>

                <p className="mb-2">
                  Score: <strong>{result.score}%</strong>
                </p>

                <p className="mb-2">
                  Correct answers:{" "}
                  <strong>
                    {result.correct_answers} / {result.total_questions}
                  </strong>
                </p>

                <p className="mb-3">
                  Required to pass: <strong>{result.pass_percentage}%</strong>
                </p>

                {result.passed && (
                  <>
                    {!certificateRequest ? (
                      <button
                        className="btn btn-primary px-4"
                        disabled={certificateLoading}
                        onClick={handleRequestCertificate}
                      >
                        {certificateLoading
                          ? "Requesting..."
                          : "Request Certificate"}
                      </button>
                    ) : certificateRequest.certificate_status === "PENDING" ? (
                      <div className="alert alert-info mb-0">
                        Your certificate request is being reviewed.
                        <br />
                        <strong>Status:</strong> PENDING
                      </div>
                    ) : certificateRequest.certificate_status === "ISSUED" ? (
                      <div className="alert alert-success mb-0">
                        Your certificate has been approved and issued
                        successfully.
                        <br />
                        <strong>Status:</strong> ISSUED
                      </div>
                    ) : (
                      <div className="alert alert-secondary mb-0">
                        <strong>Status:</strong>{" "}
                        {certificateRequest.certificate_status}
                      </div>
                    )}
                  </>
                )}

                {!result.passed && result.reset && (
                  <div className="alert alert-warning mt-3 mb-0">
                    You have failed all allowed attempts. Your course progress
                    has been reset. You can start the course again from the
                    beginning.
                  </div>
                )}
              </div>
            </div>
          )}

          {inProgressAttempt && (
            <div className="alert alert-warning">
              You already have an unfinished attempt:
              <strong className="ms-1">
                Attempt {inProgressAttempt.attempt_number}
              </strong>
              <div className="mt-3">
                <button
                  className="btn btn-warning"
                  onClick={() => resumeExistingTest(inProgressAttempt.id)}
                  disabled={starting}
                >
                  {starting ? "Resuming..." : "Resume Test"}
                </button>
              </div>
            </div>
          )}

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h4 className="mb-4">Test Attempts</h4>

              {attempts.length === 0 ? (
                <p className="text-muted">
                  You have not attempted this test yet.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>

                    <tbody>
                      {attempts.map((item) => (
                        <tr key={item.id}>
                          <td>#{item.attempt_number}</td>

                          <td>
                            {item.score !== null ? `${item.score}%` : "—"}
                          </td>

                          <td>
                            {item.status === "COMPLETED" ? (
                              item.passed ? (
                                <span className="badge bg-success">PASSED</span>
                              ) : (
                                <span className="badge bg-danger">FAILED</span>
                              )
                            ) : (
                              <span className="badge bg-warning text-dark">
                                IN PROGRESS
                              </span>
                            )}
                          </td>

                          <td>{formatDuration(item.actual_duration)}</td>

                          <td>{formatDate(item.submitted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {!hasPassed && !inProgressAttempt && (
            <div className="text-center mt-4">
              <button
                className="btn btn-primary px-4"
                onClick={startTest}
                disabled={starting}
              >
                {starting ? "Starting Test..." : "Start Test"}
              </button>
            </div>
          )}

          <div className="text-center mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/learner/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
