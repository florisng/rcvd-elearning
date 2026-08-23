import React, { useEffect, useState } from "react";
import API_URL from "../api";

const AdminDashboard = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingInstructors = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/admin/instructors/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load instructors.");
      }

      setInstructors(data.instructors);
    } catch (err) {
      console.error("Error fetching pending instructors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInstructors();
  }, []);

  if (loading) {
    return <p>Loading pending instructors...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <h2>Pending Instructor Approvals</h2>

      {instructors.length === 0 ? (
        <p>No instructors are waiting for approval.</p>
      ) : (
        <div>
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
              }}
            >
              <h3>
                {instructor.first_name} {instructor.last_name}
              </h3>

              <p>
                <strong>Email:</strong> {instructor.email}
              </p>

              <p>
                <strong>Phone:</strong> {instructor.phone || "N/A"}
              </p>

              <p>
                <strong>RCVD Registration:</strong>{" "}
                {instructor.rcvd_registration_number || "N/A"}
              </p>

              <p>
                <strong>Professional Title:</strong>{" "}
                {instructor.professional_title || "N/A"}
              </p>

              <p>
                <strong>Status:</strong> {instructor.approval_status}
              </p>

              <button
                className="btn btn-primary"
                type="button"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");

                    const response = await fetch(
                      `${API_URL}/api/admin/instructors/${instructor.id}/approve`,
                      {
                        method: "PATCH",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.error || "Failed to approve instructor.",
                      );
                    }

                    // Remove the approved instructor from the pending list
                    setInstructors((current) =>
                      current.filter((item) => item.id !== instructor.id),
                    );
                  } catch (err) {
                    console.error("Error approving instructor:", err);
                    alert(err.message);
                  }
                }}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
