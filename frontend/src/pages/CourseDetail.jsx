import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./css/CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams(); // get course ID from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with API call to fetch course by ID
    // Example mock data
    const mockCourse = {
      id,
      title: "React Basics",
      description: "Learn the fundamentals of React.js",
      instructor: "Alice Johnson",
      price: 45000,
      duration: 7200, // in seconds
      content: [
        {
          chapter: "Introduction",
          subchapters: ["What is React?", "Setting up the environment"]
        },
        {
          chapter: "Components",
          subchapters: ["Functional Components", "Class Components", "Props & State"]
        },
        {
          chapter: "Routing",
          subchapters: ["React Router Basics", "Nested Routes"]
        }
      ]
    };

    setCourse(mockCourse);
    setLoading(false);
  }, [id]);

  if (loading) return <p className="loading-text">Loading course...</p>;
  if (!course) return <p className="loading-text">Course not found</p>;

  // Format price
  const formattedPrice = course.price.toLocaleString() + " RWF";

  // Format duration to H:M
  const hours = Math.floor(course.duration / 3600);
  const minutes = Math.floor((course.duration % 3600) / 60);

  return (
    <div className="course-detail-container">
      <h1 className="course-title">{course.title}</h1>
      <p className="course-description">{course.description}</p>

      <div className="course-meta">
        <p><strong>Instructor:</strong> {course.instructor}</p>
        <p><strong>Price:</strong> {formattedPrice}</p>
        <p><strong>Duration:</strong> {hours}h {minutes}m</p>
      </div>

      <div className="course-content">
        <h2>Course Content</h2>
        {course.content.map((chapter, idx) => (
          <div key={idx} className="chapter">
            <h3>{chapter.chapter}</h3>
            <ul>
              {chapter.subchapters.map((sub, sIdx) => (
                <li key={sIdx}>{sub}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
