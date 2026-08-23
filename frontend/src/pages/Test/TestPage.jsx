import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  startTest as startTestApi,
  resumeTest,
  saveAnswer,
  submitTest,
  getTestAttempts,
} from "../../services/testService";

function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [test, setTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});

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

  const loadAttempts = async () => {
    const data = await getTestAttempts(testId, token);

    setTest(data.test);
    setAttempts(data.attempts || []);
  };

  const startTest = async () => {
    setStarting(true);
    setError("");

    try {
      const data = await startTestApi(testId, token);

      setAttempt(data.attempt);
      setQuestions(data.questions || []);

      // Load any answers that may already exist
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

  useEffect(() => {
    const loadTest = async () => {
      try {
        await loadAttempts();
      } catch (err) {
        console.error("Error loading test:", err);
        setError(err.message);
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

  // If an attempt has started, show the test
  if (attempt) {
    return (
      <div className="container py-5">
        <h2>{test.title}</h2>

        <div className="mb-4">
          Attempt {attempt.attempt_number} · {questions.length} questions
        </div>

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
            onClick={async () => {
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
                const data = await submitTest(attempt.id, answers, token);

                window.alert(
                  `Test submitted successfully!\n\nScore: ${data.result.score}%\nCorrect answers: ${data.result.correct_answers}/${data.result.total_questions}\n\n${
                    data.result.passed
                      ? "Congratulations! You passed."
                      : "Unfortunately, you did not pass."
                  }`,
                );

                navigate(`/tests/${testId}`);
              } catch (err) {
                console.error("Error submitting test:", err);

                setError(
                  err.response?.data?.error ||
                    err.message ||
                    "Failed to submit test.",
                );
              } finally {
                setStarting(false);
              }
            }}
            disabled={starting}
          >
            {starting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>
    );
  }

  const completedAttempts = attempts.filter(
    (item) => item.status === "COMPLETED",
  );

  const inProgressAttempt = attempts.find(
    (item) => item.status === "IN_PROGRESS",
  );

  const hasPassed = attempts.some((item) => item.passed === true);

  const attemptsUsed = attempts.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  const canStart =
    !hasPassed &&
    !inProgressAttempt &&
    attemptsUsed < Number(test.max_attempts);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h2 className="mb-2">{test.title}</h2>

              <p className="text-muted mb-0">
                Maximum attempts: {test.max_attempts}
              </p>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {hasPassed && (
            <div className="alert alert-success">
              <strong>Congratulations!</strong> You have already passed this
              test.
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
                  onClick={async () => {
                    setError("");
                    setStarting(true);

                    try {
                      const data = await resumeTest(
                        inProgressAttempt.id,
                        token,
                      );

                      setAttempt(data.attempt);
                      setQuestions(data.questions || []);

                      const existingAnswers = {};

                      (data.answers || []).forEach((answer) => {
                        existingAnswers[answer.question_id] = answer.option_id;
                      });

                      setAnswers(existingAnswers);
                    } catch (err) {
                      console.error("Error resuming test:", err);

                      setError(
                        err.response?.data?.error ||
                          err.message ||
                          "Failed to resume test.",
                      );
                    } finally {
                      setStarting(false);
                    }
                  }}
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

          <div className="text-center mt-4">
            {canStart && (
              <button
                className="btn btn-primary px-4"
                onClick={startTest}
                disabled={starting}
              >
                {starting ? "Starting Test..." : "Start Test"}
              </button>
            )}

            {attemptsUsed >= Number(test.max_attempts) && !hasPassed && (
              <div className="alert alert-danger mt-3">
                You have reached the maximum number of attempts.
              </div>
            )}
          </div>

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
