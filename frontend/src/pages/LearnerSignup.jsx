import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./css/Auth.css";

const LearnerSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    rcvd_registration_number: "",
    professional_title: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          rcvd_registration_number: formData.rcvd_registration_number,
          professional_title: formData.professional_title,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        rcvd_registration_number: "",
        professional_title: "",
        password: "",
        confirm_password: "",
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Learner registration error:", err);
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card auth-register-card">
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
            <h2>Become a Learner</h2>

            <p>
              Create your account and join the RCVD professional learning
              community to access veterinary courses and assessments.
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* First name / Last name */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label htmlFor="first_name">First name</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-person"></i>

                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="last_name">Last name</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-person"></i>

                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-envelope"></i>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Phone / Professional title */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label htmlFor="phone">Phone</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-telephone"></i>

                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="professional_title">Professional title</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-briefcase"></i>

                  <select
                    id="professional_title"
                    name="professional_title"
                    value={formData.professional_title}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select title</option>
                    <option value="Veterinary Technician (A1, A2)">
                      Veterinary Technician (A1, A2)
                    </option>
                    <option value="Veterinary Technologist">
                      Veterinary Technologist
                    </option>
                    <option value="Animal Scientist">Animal Scientist</option>
                    <option value="Veterinary Doctor">Veterinary Doctor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RCVD registration number */}
            <div className="auth-field">
              <label htmlFor="rcvd_registration_number">
                RCVD registration number
              </label>

              <div className="auth-input-wrapper">
                <i className="bi bi-card-text"></i>

                <input
                  id="rcvd_registration_number"
                  type="text"
                  name="rcvd_registration_number"
                  value={formData.rcvd_registration_number}
                  onChange={handleChange}
                  placeholder="Enter your RCVD registration number"
                  required
                />
              </div>
            </div>

            {/* Password / Confirm password */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-lock"></i>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="confirm_password">Confirm password</label>

                <div className="auth-input-wrapper">
                  <i className="bi bi-lock-fill"></i>

                  <input
                    id="confirm_password"
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Learner Account
                  <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>

          <div className="auth-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>

          <div className="auth-footer">
            <i className="bi bi-shield-check"></i>
            Professional veterinary education by RCVD
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="learner-success-overlay">
          <div className="learner-success-modal">
            <div className="learner-success-icon">
              <i className="bi bi-check-lg"></i>
            </div>

            <h2>Account Created Successfully</h2>

            <p>
              Your learner account has been created successfully. You can now
              sign in.
            </p>

            <button
              type="button"
              className="auth-submit-btn"
              onClick={handleGoToLogin}
            >
              Go to Login
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LearnerSignup;
