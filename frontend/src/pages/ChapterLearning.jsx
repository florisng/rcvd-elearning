import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API_URL from "../api";

const ChapterLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseId = searchParams.get("courseId");

  const [chapter, setChapter] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Keep the latest elapsed time available to cleanup/save functions
  const elapsedRef = useRef(0);

  // Prevent multiple learning-time requests at the same time
  const savingRef = useRef(false);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        if (!courseId) {
          throw new Error("Course ID is missing.");
        }

        // Get the learner's enrolled course
        const courseRes = await fetch(`${API_URL}/api/my-courses/${courseId}`, {
          headers,
        });

        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          throw new Error(courseData.error || "Failed to load course.");
        }

        // Find the chapter inside the course
        let foundChapter = null;

        for (const courseChapter of courseData.course.chapters || []) {
          if (String(courseChapter.id) === String(id)) {
            foundChapter = courseChapter;
            break;
          }
        }

        if (!foundChapter) {
          throw new Error("Chapter not found.");
        }

        setChapter(foundChapter);

        // Get saved learning progress
        const progressRes = await fetch(
          `${API_URL}/api/chapters/${id}/learning-progress`,
          { headers },
        );

        const progressData = await progressRes.json();

        if (!progressRes.ok) {
          throw new Error(
            progressData.error || "Failed to load learning progress.",
          );
        }

        setLearningProgress(progressData.progress);
      } catch (err) {
        console.error("Error loading chapter:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id, courseId]);

  // Count learning time while the learner is on the chapter
  useEffect(() => {
    if (!chapter || !learningProgress) {
      return;
    }

    if (learningProgress.completed) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [chapter, learningProgress]);

  // Save learning time every 10 seconds
  useEffect(() => {
    if (!chapter || !learningProgress || learningProgress.completed) {
      return;
    }

    const saveLearningTime = async () => {
      if (savingRef.current) {
        return;
      }

      const secondsToSave = elapsedRef.current;

      if (secondsToSave <= 0) {
        return;
      }

      savingRef.current = true;

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/chapters/${id}/learning-time`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seconds: secondsToSave,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to save learning time.");
        }

        // Remove only the seconds that were actually saved
        setElapsedSeconds((prev) => Math.max(0, prev - secondsToSave));

        setLearningProgress(data.progress);
      } catch (err) {
        console.error("Error saving learning time:", err);
      } finally {
        savingRef.current = false;
      }
    };

    const interval = setInterval(saveLearningTime, 10000);

    return () => clearInterval(interval);
  }, [chapter, learningProgress, id]);

  // Save any remaining unsaved time when leaving the chapter
  useEffect(() => {
    return () => {
      const secondsToSave = elapsedRef.current;

      if (secondsToSave <= 0) {
        return;
      }

      const token = localStorage.getItem("token");

      fetch(`${API_URL}/api/chapters/${id}/learning-time`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seconds: secondsToSave,
        }),
        keepalive: true,
      }).catch((err) => {
        console.error("Error saving final learning time:", err);
      });
    };
  }, [id]);

  const markChapterCompleted = async () => {
    try {
      setCompleting(true);
      setError("");

      // Save any currently pending learning time first
      const pendingSeconds = elapsedRef.current;

      if (pendingSeconds > 0) {
        const token = localStorage.getItem("token");

        const saveRes = await fetch(
          `${API_URL}/api/chapters/${id}/learning-time`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              seconds: pendingSeconds,
            }),
          },
        );

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
          throw new Error(saveData.error || "Failed to save learning time.");
        }

        setLearningProgress(saveData.progress);
        setElapsedSeconds(0);
        elapsedRef.current = 0;
      }

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/chapters/${id}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark chapter as completed.");
      }

      setLearningProgress(data.progress);
      setElapsedSeconds(0);
      elapsedRef.current = 0;
    } catch (err) {
      console.error("Error completing chapter:", err);
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-3">Loading chapter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <button
          className="btn btn-secondary"
          onClick={() =>
            courseId ? navigate(`/courses/${courseId}`) : navigate("/courses")
          }
        >
          Back to Course
        </button>
      </div>
    );
  }

  if (!chapter || !learningProgress) {
    return null;
  }

  const savedSeconds = learningProgress.learning_time_seconds || 0;

  const currentSeconds = savedSeconds + elapsedSeconds;

  const requiredSeconds = learningProgress.required_time_seconds || 0;

  const percentage =
    requiredSeconds > 0
      ? Math.min(100, Math.round((currentSeconds / requiredSeconds) * 100))
      : 100;

  const remainingSeconds = Math.max(0, requiredSeconds - currentSeconds);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  };

  const canComplete = currentSeconds >= requiredSeconds;

  return (
    <div className="container py-4 py-md-5">
      <button
        className="btn btn-link text-decoration-none px-0 mb-4"
        onClick={() => navigate(`/courses/${courseId}`)}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Back to Course
      </button>

      <div className="card shadow-sm">
        <div className="card-body p-4 p-md-5">
          <span className="text-uppercase small fw-bold">Chapter Learning</span>

          <h1 className="mt-2">{chapter.title}</h1>

          <div className="mt-4">
            <div className="d-flex justify-content-between mb-2">
              <strong>Learning progress</strong>

              <span>{percentage}%</span>
            </div>

            <div className="progress" style={{ height: "10px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-4">
              <div className="border rounded p-3">
                <small className="text-muted">Required time</small>

                <h4 className="mb-0">{formatTime(requiredSeconds)}</h4>
              </div>
            </div>

            <div className="col-md-4 mt-3 mt-md-0">
              <div className="border rounded p-3">
                <small className="text-muted">Time learned</small>

                <h4 className="mb-0">{formatTime(currentSeconds)}</h4>
              </div>
            </div>

            <div className="col-md-4 mt-3 mt-md-0">
              <div className="border rounded p-3">
                <small className="text-muted">Remaining</small>

                <h4 className="mb-0">{formatTime(remainingSeconds)}</h4>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="chapter-content">
            {chapter.subchapters?.map((subchapter) => (
              <article key={subchapter.id} className="mb-4">
                <h3>{subchapter.title}</h3>

                <div
                  dangerouslySetInnerHTML={{
                    __html: subchapter.content,
                  }}
                />
              </article>
            ))}
          </div>

          {learningProgress.completed ? (
            <div className="alert alert-success mt-4 mb-0">
              <i className="bi bi-check-circle-fill me-2"></i>

              <strong>Chapter completed!</strong>

              <div className="mt-1">You have completed this chapter.</div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="alert alert-info mb-3">
                <i className="bi bi-clock me-2"></i>
                Your learning time is being recorded automatically.
              </div>

              <button
                className="btn btn-primary"
                onClick={markChapterCompleted}
                disabled={completing || !canComplete}
              >
                {completing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Marking as completed...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Mark as completed
                  </>
                )}
              </button>

              {!canComplete && (
                <small className="text-muted d-block mt-2">
                  Complete the required learning time before marking this
                  chapter as completed.
                </small>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterLearning;
