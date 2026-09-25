import React, { useState } from "react";
import "./css/LearnerProfile.css";

const LearnerProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: storedUser.first_name || "",
    last_name: storedUser.last_name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    professional_title: storedUser.professional_title || "",
    rcvd_registration_number: storedUser.rcvd_registration_number || "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      first_name: storedUser.first_name || "",
      last_name: storedUser.last_name || "",
      email: storedUser.email || "",
      phone: storedUser.phone || "",
      professional_title: storedUser.professional_title || "",
      rcvd_registration_number: storedUser.rcvd_registration_number || "",
    });

    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    // Backend update will be added next.
    console.log("Profile data:", formData);

    setIsEditing(false);
  };

  return (
    <div className="learner-profile-page">
      <div className="learner-profile-container">
        {/* Page Header */}
        <div className="learner-profile-header">
          <div>
            <span className="learner-profile-label">RCVD E-LEARNING</span>

            <h1>My Profile</h1>

            <p>Manage your personal and professional information.</p>
          </div>

          {!isEditing && (
            <button
              type="button"
              className="learner-profile-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil-square"></i>
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="learner-profile-card">
          {/* Profile Summary */}
          <div className="learner-profile-summary">
            <div className="learner-profile-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div className="learner-profile-name">
              <h2>
                {formData.first_name || "Learner"} {formData.last_name || ""}
              </h2>

              <p>
                <i className="bi bi-mortarboard-fill"></i>
                Learner
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Personal Information */}
            <div className="learner-profile-section">
              <div className="learner-profile-section-title">
                <div className="profile-section-icon">
                  <i className="bi bi-person-vcard"></i>
                </div>

                <div>
                  <h3>Personal Information</h3>
                  <p>Your basic contact information.</p>
                </div>
              </div>

              <div className="learner-profile-grid">
                <div className="learner-profile-field">
                  <label>First Name</label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <div>{formData.first_name || "—"}</div>
                  )}
                </div>

                <div className="learner-profile-field">
                  <label>Last Name</label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <div>{formData.last_name || "—"}</div>
                  )}
                </div>

                <div className="learner-profile-field">
                  <label>Email Address</label>

                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  ) : (
                    <div>{formData.email || "—"}</div>
                  )}
                </div>

                <div className="learner-profile-field">
                  <label>Phone Number</label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <div>{formData.phone || "—"}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="learner-profile-section">
              <div className="learner-profile-section-title">
                <div className="profile-section-icon">
                  <i className="bi bi-briefcase"></i>
                </div>

                <div>
                  <h3>Professional Information</h3>
                  <p>Your veterinary professional information.</p>
                </div>
              </div>

              <div className="learner-profile-grid">
                <div className="learner-profile-field">
                  <label>Professional Title</label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="professional_title"
                      value={formData.professional_title}
                      onChange={handleChange}
                    />
                  ) : (
                    <div>{formData.professional_title || "—"}</div>
                  )}
                </div>

                <div className="learner-profile-field">
                  <label>RCVD Registration Number</label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="rcvd_registration_number"
                      value={formData.rcvd_registration_number}
                      onChange={handleChange}
                    />
                  ) : (
                    <div>{formData.rcvd_registration_number || "—"}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="learner-profile-section">
              <div className="learner-profile-section-title">
                <div className="profile-section-icon">
                  <i className="bi bi-shield-check"></i>
                </div>

                <div>
                  <h3>Account Information</h3>
                  <p>Information about your RCVD account.</p>
                </div>
              </div>

              <div className="learner-profile-grid">
                <div className="learner-profile-field">
                  <label>Account Role</label>
                  <div>Learner</div>
                </div>

                <div className="learner-profile-field">
                  <label>Account Status</label>

                  <div className="profile-status">
                    <span className="profile-status-dot"></span>
                    Active
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="learner-profile-actions">
                <button
                  type="button"
                  className="learner-profile-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button type="submit" className="learner-profile-save-btn">
                  <i className="bi bi-check-lg"></i>
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LearnerProfile;
