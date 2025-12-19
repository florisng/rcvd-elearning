import React, { useEffect, useState } from "react";

const InstructorDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/instructor/${user.id}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data));
  }, [user.id]);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;

    await fetch(`http://localhost:4000/api/courses/${courseId}`, {
      method: "DELETE"
    });

    setCourses(courses.filter(c => c.id !== courseId));
  };

  return (
    <div className="dashboard-container">
      <h1>Instructor Dashboard</h1>

      <button className="add-course-btn">+ Add New Course</button>

      {courses.map(course => (
        <div key={course.id} className="course-card">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p>
            {Number(course.price).toLocaleString()} RWF • {course.duration / 3600}h
          </p>

          <div className="course-actions">
            <button>Edit</button>
            <button onClick={() => handleDelete(course.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InstructorDashboard;
