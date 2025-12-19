import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const dummyUsers = [
  { id: "learner1", firstname: "John", lastname: "Doe", password: "pass123", phone: "0787030024" }
];

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("learner"); // default selection
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || (userType === "instructor" ? "/instructor/dashboard" : "/courses");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (userType === "learner") {
      // Find user in dummy data
      const foundUser = dummyUsers.find(u => u.id === userId && u.password === password);
      if (foundUser) {
        // Add type dynamically
        const learnerUser = { ...foundUser, type: "learner" };
        localStorage.setItem("user", JSON.stringify(learnerUser));
        navigate(from, { replace: true });
      } else {
        setError("Invalid learner ID or password");
      }
    }

    if (userType === "instructor") {
      try {
        const res = await fetch(`http://localhost:4000/api/instructor/${userId}`);
        if (!res.ok) throw new Error("Instructor not found");
        const data = await res.json();

        if (data.password.trim() === password.trim()) {
          const instructorUser = { 
            id: data.id, 
            firstname: data.firstname, 
            lastname: data.lastname, 
            type: "instructor" 
          };
          localStorage.setItem("user", JSON.stringify(instructorUser));
          navigate("/instructor/dashboard", { replace: true });
        } else {
          setError("Invalid password");
        }
      } catch (err) {
        console.error(err);
        setError("Instructor not found or invalid credentials");
      }
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
            onChange={e => setUserId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          />
        </div>
        <div>
          <label>User Type:</label>
          <select value={userType} onChange={e => setUserType(e.target.value)} style={{ width: "100%", padding: "8px", margin: "8px 0" }}>
            <option value="learner">Learner</option>
            <option value="instructor">Instructor</option>
          </select>
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
