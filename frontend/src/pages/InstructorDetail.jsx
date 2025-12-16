import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// import "./css/InstructorDetail.css";

const InstructorDetail = () => {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/instructor/${id}`);
        const data = await res.json();
        setInstructor(data);
      } catch (err) {
        console.error("Error fetching instructor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  if (loading) {
    return <p className="loading-text">Loading instructor...</p>;
  }

  if (!instructor) {
    return <p className="loading-text">Instructor not found</p>;
  }

  return (
    <div className="instructor-detail-container">
      <h1 className="instructor-name">{instructor.name}</h1>
      
      <hr />

      <p className="instructor-contact"><strong>Email:</strong> {instructor.email}</p>
      <p className="instructor-contact"><strong>Phone:</strong> {instructor.phone}</p>
      <p className="instructor-bio"><strong>Job title:</strong> {instructor.bio}</p>


      <h3>Courses</h3>
      {instructor.courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <div className="instructor-courses">
  {instructor.courses.map((course, index) => (
    <div key={course.id} className="course-card">
      <a href={`/course/${course.id}`} className="course-link">
        <h3>
          {index + 1}. {course.title}
        </h3>
      </a>
      <p className="course-description">{course.description}</p>
      <span className="course-price">
        Price: {Number(course.price).toLocaleString()} RWF
      </span>
    </div>
  ))}
</div>

      )}
    </div>
  );
};

export default InstructorDetail;
