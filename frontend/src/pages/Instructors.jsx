import React, { useEffect, useState } from "react";
import "./css/Instructors.css";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/instructors");
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
    <div className="instructors-container">
      <h1 className="instructors-title">Our Instructors</h1>

      <p className="instructors-intro">
        Meet our expert facilitators who design and guide RCVD e-Learning courses.
        Our instructors bring real-world veterinary expertise to support your
        professional growth.
      </p>

      <div className="instructors-grid">
        {instructors.map((inst) => (
          <div key={inst.id} className="instructor-card">
            <div className="instructor-avatar">
                <h2 className="instructor-name">{inst.id}. {inst.name}</h2>
                <a href={`/instructor/${inst.id}`} className="link">Details</a>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instructors;
