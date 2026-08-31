import React, { useEffect, useState } from "react";
import API_URL from "../api";
import "./css/Instructors.css";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstructors = async () => {
      console.log("INSTRUCTORS PAGE LOADED");

      try {
        const res = await fetch(`${API_URL}/api/instructors`);

        console.log("INSTRUCTORS RESPONSE STATUS:", res.status);

        const data = await res.json();

        console.log("INSTRUCTORS DATA:", data);

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load instructors.");
        }

        setInstructors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching instructors:", err);
        setError(err.message || "Failed to load instructors.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="instructors-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p>Loading instructors...</p>
      </div>
    );
  }

  return (
    <section className="instructors-page">
      <div className="instructors-wrapper">
        {/* Page heading */}
        <div className="instructors-heading">
          <span className="instructors-label">RCVD E-LEARNING</span>

          <h1>Our Instructors</h1>

          <p>
            Meet the veterinary professionals who share their knowledge and
            expertise through RCVD E-Learning.
          </p>
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Instructor list */}
        {!error && instructors.length > 0 && (
          <div className="instructors-list">
            {instructors.map((inst) => {
              const firstName = inst.firstname || "";
              const lastName = inst.lastname || "";

              const fullName =
                `${firstName} ${lastName}`.trim() || "Instructor";

              const initials =
                `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
                "I";

              return (
                <div className="instructor-item" key={inst.id}>
                  {/* Avatar */}
                  <div className="instructor-profile-icon">{initials}</div>

                  {/* Details */}
                  <div className="instructor-details">
                    <h2>{fullName}</h2>

                    {inst.specialization && (
                      <p className="instructor-specialization">
                        {inst.specialization}
                      </p>
                    )}

                    <a
                      href={`/instructor/${inst.id}`}
                      className="instructor-profile-link"
                    >
                      View profile
                      <span>→</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!error && instructors.length === 0 && (
          <div className="instructors-empty">
            <h3>No instructors available</h3>

            <p>There are currently no instructors available on the platform.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Instructors;
