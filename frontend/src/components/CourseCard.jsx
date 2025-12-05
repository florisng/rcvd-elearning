import React from "react";

const CourseCard = ({ course }) => {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "16px",
      margin: "8px",
      width: "250px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }}>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p><strong>Instructor:</strong> {course.instructor}</p>
    </div>
  );
};

export default CourseCard;
