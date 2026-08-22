import React, { useEffect, useState } from "react";
import "./css/InstructorDashboard.css";
import API_URL from "../api";

const InstructorDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/api/instructor/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching instructor courses:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="instructor-dashboard">
      <h1>Instructor Dashboard</h1>
      <p className="welcome-text">
        Welcome back, <strong>{user.firstname}</strong>
      </p>

      <h2>Your Courses</h2>

      {courses.length === 0 ? (
        <p>You have not created any courses yet.</p>
      ) : (
        <div className="instructor-courses">
          {courses.map((course) => (
            <div key={course.id} className="instructor-course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>
                <b>Price:</b> {Number(course.price).toLocaleString()} RWF
              </p>
              <p>
                <b>Duration:</b> {Math.floor(course.duration / 3600)}h{" "}
                {Math.floor((course.duration % 3600) / 60)}m
              </p>
              <p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    window.location.href = `/instructor/course/${course.id}`;
                  }}
                >
                  Manage Course
                </button>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
