import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./css/CourseDetail.css";
import API_URL from "../api";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/courses/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load course.");
        }

        return res.json();
      })
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="loading-text">Loading course...</p>;
  }

  if (!course) {
    return <p className="loading-text">Course not found</p>;
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters((previous) => ({
      ...previous,
      [chapterId]: !previous[chapterId],
    }));
  };

  const chapters = course.chapters || [];

  return (
    <div className="course-page-container">
      {/* Course Title */}
      <h1 className="course-title">{course.title}</h1>
      <hr />

      {/* Instructor */}
      <p className="course-instructor">
        <b>Instructor:</b> {course.instructor_name || "N/A"}
      </p>

      {/* Description */}
      <p className="course-description">
        <b>Description:</b> {course.description || "No description available"}
      </p>

      {/* Price & Duration */}
      <p className="course-info">
        <i>
          <b>Price:</b>{" "}
          {course.price ? Number(course.price).toLocaleString() : "0"} RWF -{" "}
          <b>Duration:</b>{" "}
          {course.duration ? Math.floor(course.duration / 3600) : 0}h{" "}
          {course.duration ? Math.floor((course.duration % 3600) / 60) : 0}m
        </i>
      </p>

      {/* Chapters */}
      <h3>Chapters</h3>

      {chapters.length === 0 && <p>No chapters available</p>}

      {chapters.map((chapter) => {
        const subchapters = chapter.subchapters || [];

        return (
          <div key={chapter.id} className="chapter-card">
            <div
              className="chapter-header"
              onClick={() => toggleChapter(chapter.id)}
            >
              {chapter.title}
            </div>

            {expandedChapters[chapter.id] && (
              <ul className="subchapter-list">
                {subchapters.length === 0 && <li>No subchapters available</li>}

                {subchapters.map((sub) => (
                  <li key={sub.id} className="subchapter-item">
                    <strong>{sub.title}</strong>:{" "}
                    {sub.content || "No content available"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* Final Test */}
      <div className="mt-5 mb-5">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center">
            <h3 className="mb-3">Final Test</h3>

            <p className="text-muted">
              Complete the final test to evaluate your knowledge of this course.
            </p>

            <button
              className="btn btn-primary px-4"
              onClick={() => navigate(`/tests/${id}`)}
            >
              Take Final Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
