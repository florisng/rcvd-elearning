import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../api";

const LearnerCourse = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedSubchapters, setCompletedSubchapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Get course content
        const courseRes = await fetch(`${API_URL}/api/my-courses/${id}`, {
          headers,
        });

        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          throw new Error(courseData.error || "Failed to load course.");
        }

        // Get learner progress
        const progressRes = await fetch(
          `${API_URL}/api/my-courses/${id}/progress`,
          { headers },
        );

        const progressData = await progressRes.json();

        if (!progressRes.ok) {
          throw new Error(progressData.error || "Failed to load progress.");
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

      setCompletedSubchapters((prev) => [...prev, subchapterId]);

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
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container py-5">
      <h1>{course.title}</h1>

      <p className="text-muted">{course.description}</p>

      {progress && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <strong>Course Progress: </strong>
              <strong>{progress.percentage}%</strong>
            </div>

            {progress.percentage === 100 && (
              <div className="alert alert-success mt-3 mb-0">
                🎉 <strong>Course Completed!</strong> Congratulations, you have
                completed all the subchapters in this course.
              </div>
            )}

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
                  backgroundColor: "#198754",
                  borderRadius: "7px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div className="mt-2 text-muted">
              {progress.completed_subchapters} completed ·{" "}
              {progress.remaining_subchapters} remaining
            </div>
          </div>
        </div>
      )}

      <hr />

      {course.chapters?.map((chapter, index) => (
        <div className="card mb-4 shadow-sm" key={chapter.id}>
          <div className="card-header">
            <h4 className="mb-0">
              Chapter {index + 1}: {chapter.title}
            </h4>
          </div>

          <div className="card-body">
            {chapter.subchapters?.map((subchapter, subIndex) => (
              <div key={subchapter.id} className="border-bottom py-3">
                <h5>
                  {index + 1}.{subIndex + 1} {subchapter.title}
                </h5>

                <p className="text-muted">{subchapter.content}</p>

                {completedSubchapters.includes(subchapter.id) ? (
                  <span className="badge bg-success">✓ Completed</span>
                ) : (
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => markAsCompleted(subchapter.id)}
                  >
                    Mark as completed
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearnerCourse;
