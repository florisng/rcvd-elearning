import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import "./css/Courses.css"; // import the styles

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // For now we use mock data
    const mockCourses = [
      { id: 1, title: "React Basics", description: "Learn the basics of React", instructor: "Alice" },
      { id: 2, title: "Node.js Fundamentals", description: "Learn Node.js backend", instructor: "Bob" },
      { id: 3, title: "Advanced CSS", description: "Master CSS layouts and animations", instructor: "Carol" },
      { id: 4, title: "JavaScript ES6", description: "Modern JavaScript features", instructor: "Dave" },
      { id: 5, title: "Python for Beginners", description: "Start programming in Python", instructor: "Eve" },
      { id: 6, title: "React Hooks", description: "Deep dive into React Hooks", instructor: "Frank" },
      { id: 7, title: "Node.js & Express", description: "Build backend APIs with Node.js", instructor: "Grace" },
      { id: 8, title: "Advanced CSS Animations", description: "Create stunning UI animations", instructor: "Hannah" },
      { id: 9, title: "Fullstack Project", description: "Build a fullstack app with React and Node", instructor: "Ivy" },
      { id: 10, title: "Database Design", description: "Learn how to design relational databases", instructor: "Jack" }
    ];
    setCourses(mockCourses);
  }, []);

  return (
    <div className="courses-container">
      <h1 className="courses-title">Available Courses</h1>
      <div className="courses-list">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;
