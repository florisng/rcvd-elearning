import React, { useState } from "react";
import "./css/Login.css";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Dummy users with roles
  const users = [
    { user_id: "learner1", password: "12345", role: "learner" },
    { user_id: "instructor1", password: "abcde", role: "instructor" },
    { user_id: "admin", password: "admin123", role: "admin" }, // only one admin
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const user = users.find(
      (u) => u.user_id === userId && u.password === password
    );

    if (!user) {
      setError("Invalid User ID or Password");
      return;
    }

    alert(`Login successful! Logged in as ${user.role}`);

    // Example: redirect based on role
    if (user.role === "admin") {
      console.log("Redirect to admin dashboard...");
    } else if (user.role === "instructor") {
      console.log("Redirect to instructor dashboard...");
    } else {
      console.log("Redirect to learner dashboard...");
    }

    // TODO: actual navigation using react-router
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <label>User ID</label>
          <input
            type="text"
            placeholder="Enter your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
