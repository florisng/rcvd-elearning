import React from "react";
import "./css/CourseCard.css"; // import the styles

const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p><strong>Instructor:</strong> {course.instructor}</p>
    </div>
  );
};

export default CourseCard;
