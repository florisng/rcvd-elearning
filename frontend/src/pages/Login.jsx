import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API_URL from "../api";
import "./css/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "RCVD_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.user.role === "INSTRUCTOR") {
        navigate("/instructor/dashboard", { replace: true });
      } else if (data.user.role === "LEARNER") {
        const from = location.state?.from?.pathname || "/learner/dashboard";

        navigate(from, { replace: true });
      } else {
        setError("Your account does not have a valid role.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-login-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>

          <div>
            <h1>RCVD E-Learning</h1>
            <span>Veterinary Professional Education</span>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Sign in to continue your veterinary learning journey.</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email address</label>

            <div className="auth-input-wrapper">
              <i className="bi bi-envelope"></i>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <div className="auth-input-wrapper">
              <i className="bi bi-lock"></i>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>New to RCVD E-Learning?</span>
        </div>

        <Link to="/register" className="auth-secondary-btn">
          Create an Instructor Account
        </Link>

        <div className="auth-footer">
          <i className="bi bi-shield-check"></i>
          Secure access for veterinary professionals
        </div>
      </div>
    </div>
  );
};

export default Login;
