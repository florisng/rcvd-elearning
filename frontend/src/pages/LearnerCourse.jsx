import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../api";

const LearnerCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedSubchapters, setCompletedSubchapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const courseRes = await fetch(`${API_URL}/api/my-courses/${id}`, {
          headers,
        });

        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          throw new Error(courseData.error || "Failed to load course.");
        }

        const progressRes = await fetch(
          `${API_URL}/api/my-courses/${id}/progress`,
          { headers },
        );

        const progressData = await progressRes.json();

        if (!progressRes.ok) {
          throw new Error(
            progressData.error || "Failed to load course progress.",
          );
        }

        setCourse(courseData.course);
        setProgress(progressData.progress);

        setCompletedSubchapters(
          progressData.completed_subchapters?.map(
            (item) => item.subchapter_id,
          ) || [],
        );
      } catch (err) {
        console.error("Error loading course:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const markAsCompleted = async (subchapterId) => {
    try {
      setCompleting(subchapterId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/subchapters/${subchapterId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to mark subchapter as completed.",
        );
      }

      setCompletedSubchapters((prev) => {
        if (prev.includes(subchapterId)) {
          return prev;
        }

        return [...prev, subchapterId];
      });

      const progressRes = await fetch(
        `${API_URL}/api/my-courses/${id}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const progressData = await progressRes.json();

      if (progressRes.ok) {
        setProgress(progressData.progress);
      }
    } catch (err) {
      console.error("Error completing subchapter:", err);
      alert(err.message);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/learner/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const isCompleted = progress?.percentage === 100;

  return (
    <div className="container py-5">
      {/* Back button */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate("/learner/dashboard")}
      >
        ← Back to My Courses
      </button>

      {/* Course header */}
      <div className="mb-4">
        <h1 className="fw-bold">{course.title}</h1>

        <p className="text-muted mb-2">{course.description}</p>

        <small className="text-muted">
          Instructor:{" "}
          <strong>
            {course.instructor_firstname} {course.instructor_lastname}
          </strong>
        </small>
      </div>

      {/* Progress */}
      {progress && (
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Course Progress</strong>

              <strong className="text-primary">{progress.percentage}%</strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "14px",
                backgroundColor: "#e9ecef",
                borderRadius: "7px",
                overflow: "hidden",
              }}
            >
              <div
                role="progressbar"
                style={{
                  width: `${progress.percentage}%`,
                  height: "100%",
                  backgroundColor: isCompleted ? "#198754" : "#0d6efd",
                  borderRadius: "7px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div className="mt-2 text-muted">
              {progress.completed_subchapters} completed ·{" "}
              {progress.remaining_subchapters} remaining
            </div>

            {isCompleted && (
              <div className="alert alert-success mt-3 mb-0">
                🎉 <strong>Course Completed!</strong>
                <br />
                Congratulations! You have completed all the subchapters in this
                course.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chapters */}
      <h2 className="mb-4">Course Content</h2>

      {course.chapters?.map((chapter, index) => (
        <div className="card mb-4 shadow-sm border-0" key={chapter.id}>
          <div className="card-header bg-primary text-white py-3">
            <h4 className="mb-0">
              Chapter {index + 1}: {chapter.title}
            </h4>
          </div>

          <div className="card-body p-4">
            {chapter.subchapters?.map((subchapter, subIndex) => {
              const completed = completedSubchapters.includes(subchapter.id);

              return (
                <div key={subchapter.id} className="border-bottom py-4">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h5 className="mb-2">
                        {index + 1}.{subIndex + 1} {subchapter.title}
                      </h5>

                      <p className="text-muted mb-3">{subchapter.content}</p>
                    </div>

                    {completed && (
                      <span className="badge bg-success">✓ Completed</span>
                    )}
                  </div>

                  {!completed && !isCompleted && (
                    <button
                      className="btn btn-outline-success btn-sm"
                      disabled={completing === subchapter.id}
                      onClick={() => markAsCompleted(subchapter.id)}
                    >
                      {completing === subchapter.id
                        ? "Saving..."
                        : "Mark as completed"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearnerCourse;
