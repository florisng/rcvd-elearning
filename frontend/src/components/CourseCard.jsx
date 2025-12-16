import React from "react";
import "./css/CourseCard.css";

const CourseCard = ({ course }) => {
  const hours = Math.floor(course.duration / 3600);
  const minutes = Math.floor((course.duration % 3600) / 60);
  const durationStr = `${hours > 0 ? hours + "h " : ""}${minutes}m`;

  const formattedPrice = new Intl.NumberFormat('en-US').format(course.price) + " RWF";

  return (
    <div className="course-card">
      <p>
        <a href={`/course/${course.id}`} id={`course-${course.id}`} className="link right">Start learning</a>
      </p>
      <h2 className="course-title">{course.title}</h2>
      <hr />
      <p className="course-description">{course.description}</p>
      <div className="course-info">
        <span className="course-instructor">Instructor: {course.instructor_name}</span>
        <span className="course-duration">Duration: {durationStr}</span>
      </div>
      <p className="course-price">Price: {formattedPrice}</p>
    </div>
  );
};

export default CourseCard;
