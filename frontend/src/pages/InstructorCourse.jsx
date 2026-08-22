import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../api";

const InstructorCourse = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/instructor/courses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load course.");
        }

        setCourse(data);
      } catch (err) {
        console.error("Error loading instructor course:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <p>Loading course...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container py-5">
      <h1>{course.title}</h1>

      <p className="text-muted">{course.description}</p>

      <hr />

      <h2>Chapters</h2>

      {course.chapters?.map((chapter, index) => (
        <div key={chapter.id} className="card mb-4 shadow-sm">
          <div className="card-header">
            <h4 className="mb-0">
              Chapter {index + 1}: {chapter.title}
            </h4>
          </div>

          <div className="card-body">
            {chapter.subchapters?.map((subchapter, subIndex) => (
              <div key={subchapter.id} className="border-bottom py-3">
                <h5>
                  {index + 1}.{subIndex + 1} {subchapter.title}
                </h5>

                <p className="text-muted mb-0">{subchapter.content}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InstructorCourse;
