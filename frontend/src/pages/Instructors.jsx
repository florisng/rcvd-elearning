import React, { useEffect, useState } from "react";
import "./css/Instructors.css";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:4000/instructors");
        const data = await res.json();
        setInstructors(data);
      } catch (err) {
        console.error("Error fetching instructors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading instructors...</p>;
  }

  return (
    <>
      <h1 className="">Our Instructors</h1>
      <div>
          Meet our expert facilitators who create and guide courses for RCVD eLearning. Our instructors bring their veterinary expertise to help you learn and succeed."
      </div>
      <div className="courses-container">
      <div className="courses-grid">
        {instructors.map(inst => (
          <div key={inst.id} className="instructor-card">
            <div className="instructor-avatar">
              {/* Optional: replace with profile image later */}
              <span>{inst.name.charAt(0)}</span>
            </div>
            <h2 className="instructor-name">{inst.name}</h2>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Instructors;
