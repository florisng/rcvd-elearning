import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // For now we use mock data
    const mockCourses = [
      { id: 1, title: "React Basics", description: "Learn the basics of React", instructor: "Alice" },
      { id: 2, title: "Node.js Fundamentals", description: "Learn Node.js backend", instructor: "Bob" },
      { id: 3, title: "Advanced CSS", description: "Master CSS layouts and animations", instructor: "Carol" }
    ];
    setCourses(mockCourses);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Available Courses</h1>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;
