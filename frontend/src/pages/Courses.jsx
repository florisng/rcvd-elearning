import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import API_URL from "../api";
import "./css/Courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/courses`);
        const data = await res.json();

        setCourses(data);

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
              enrolledData.map((course) => course.course_id),
            );
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p className="loading-text">Loading courses...</p>;

  return (
    <>
      <h1>Courses</h1>

      <div>
        <i>
          Meet our expert facilitators who create and guide courses for RCVD
          eLearning. Our instructors bring their veterinary expertise to help
          you learn and succeed.
        </i>
      </div>

      <div className="courses-container">
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.includes(course.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Courses;
