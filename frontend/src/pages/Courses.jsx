import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import "./css/Courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:4000/courses");
        const data = await res.json();
        setCourses(data);
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
      <h1 className="">Courses</h1>
      <div>
        Meet our expert facilitators who create and guide courses for RCVD eLearning. Our instructors bring their veterinary expertise to help you learn and succeed."
      </div>
      <div className="courses-container">
        <div className="courses-grid">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Courses;
