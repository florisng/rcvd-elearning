import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

const LearnerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/my-courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load courses.");
        }

        setCourses(data);
      } catch (err) {
        console.error("Error loading learner courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        {error}
      </p>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-2">Learner Dashboard</h1>
      <p className="text-muted mb-4">Welcome to your learning dashboard.</p>

      <h3 className="mb-3">My Courses</h3>

      {courses.length === 0 ? (
        <div className="alert alert-info">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <div className="row g-4">
          {courses.map((course) => (
            <div className="col-md-6 col-lg-4" key={course.course_id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>

                  <p className="card-text text-muted">{course.description}</p>

                  <p className="mb-2">
                    <strong>Instructor:</strong> {course.instructor_firstname}{" "}
                    {course.instructor_lastname}
                  </p>

                  <p className="mb-3">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        course.status === "COMPLETED"
                          ? "bg-success"
                          : "bg-primary"
                      }`}
                    >
                      {course.status}
                    </span>
                  </p>

                  <Link
                    to={`/learner/course/${course.course_id}`}
                    className="btn btn-primary"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
