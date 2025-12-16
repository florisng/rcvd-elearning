import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to the page the user tried to access
  const from = location.state?.from?.pathname || "/"; 

  // Dummy users
  const dummyUsers = [
    { id: "learner1", firstname: "John", lastname: "Doe", password: "pass123", type: "learner" },
    { id: "instructor1", firstname: "Jane", lastname: "Smith", password: "pass123", type: "instructor" },
    { id: "admin", firstname: "Mike", lastname: "Angelo", password: "admin123", type: "admin" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    const foundUser = dummyUsers.find(
      (u) => u.id === userId && u.password === password
    );

    if (foundUser) {
      // Save logged-in user in localStorage
      localStorage.setItem("user", JSON.stringify(foundUser));

      // Redirect based on user type
      if (foundUser.type === "learner") {
        navigate(from, { replace: true }); // back to requested page
      } else if (foundUser.type === "instructor") {
        navigate("/instructor-dashboard"); // create dashboard page later
      } else if (foundUser.type === "admin") {
        navigate("/admin-dashboard"); // create dashboard page later
      }
    } else {
      setError("Invalid user ID or password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "5px" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
