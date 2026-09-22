import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import API_URL from "../api";
import "./css/Courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/courses`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load courses.");
        }

        setCourses(Array.isArray(data) ? data : []);

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (token && user?.role === "LEARNER") {
          const enrolledRes = await fetch(`${API_URL}/api/my-courses`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const enrolledData = await enrolledRes.json();

          if (enrolledRes.ok) {
            setEnrolledCourseIds(
              Array.isArray(enrolledData)
                ? enrolledData.map((course) => course.course_id)
                : [],
            );
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="courses-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <section className="courses-page">
      <div className="courses-wrapper">
        {/* Page heading */}
        <div className="courses-heading">
          <span className="courses-label">RCVD E-LEARNING</span>

          <h1>Available Courses</h1>

          <p>
            Explore our professional veterinary courses and develop your
            knowledge and skills through RCVD E-Learning.
          </p>
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Course list */}
        {!error && courses.length > 0 && (
          <div className="courses-list">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={enrolledCourseIds.includes(course.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && courses.length === 0 && (
          <div className="courses-empty">
            <h3>No courses available</h3>

            <p>
              There are currently no completed courses available for learners.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Courses;
