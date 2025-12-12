import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./css/CourseDetail.css"; // import separate CSS

const CoursePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    fetch(`http://localhost:4000/api/course/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="loading-text">Loading course...</p>;
  if (!course) return <p className="loading-text">Course not found</p>;

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const chapters = course.chapters || [];

  return (
    <div className="course-page-container">
      <h1>{course.title}</h1>
      {course.instructor_name && <p className="course-instructor">Instructor: {course.instructor_name}</p>}
      
      <p className="course-price">
        <i><b>Price:</b> {course.price ? Number(course.price).toLocaleString() : "0"} RWF - <b>Duration:</b> {course.duration ? Math.floor(course.duration / 3600) : 0}h {course.duration ? Math.floor((course.duration % 3600) / 60) : 0}m</i>
      </p>
      
      <p className="course-description">{course.description || "No description available"}</p>

      <h3>Chapters</h3>
      {chapters.length === 0 && <p>No chapters available</p>}

      {chapters.map(chapter => {
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
                {subchapters.map(sub => (
                  <li key={sub.id} className="subchapter-item">
                    <strong>{sub.title}</strong>: {sub.content || "No content available"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CoursePage;
