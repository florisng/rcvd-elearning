import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ role, children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          color: "red",
        }}
      >
        <h2>🚫 Unauthorized</h2>
        <p>You are not authorized to access this page.</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
