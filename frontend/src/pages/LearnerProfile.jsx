import React from "react";
import "./css/LearnerProfile.css";

const LearnerProfile = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="learner-profile-page">
      <div className="learner-profile-container">
        {/* Page Header */}
        <div className="learner-profile-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal and professional information.</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="learner-profile-card">
          {/* Profile Header */}
          <div className="learner-profile-top">
            <div className="learner-profile-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div className="learner-profile-name">
              <h2>
                {user.first_name || "Learner"} {user.last_name || ""}
              </h2>

              <p>
                <i className="bi bi-mortarboard-fill"></i>
                Learner
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="learner-profile-section">
            <div className="learner-profile-section-title">
              <i className="bi bi-person-vcard"></i>
              <h3>Personal Information</h3>
            </div>

            <div className="learner-profile-grid">
              <div className="learner-profile-field">
                <label>First Name</label>
                <div>{user.first_name || "—"}</div>
              </div>

              <div className="learner-profile-field">
                <label>Last Name</label>
                <div>{user.last_name || "—"}</div>
              </div>

              <div className="learner-profile-field">
                <label>Email Address</label>
                <div>{user.email || "—"}</div>
              </div>

              <div className="learner-profile-field">
                <label>Phone Number</label>
                <div>{user.phone || "—"}</div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="learner-profile-section">
            <div className="learner-profile-section-title">
              <i className="bi bi-briefcase"></i>
              <h3>Professional Information</h3>
            </div>

            <div className="learner-profile-grid">
              <div className="learner-profile-field">
                <label>Professional Title</label>
                <div>{user.professional_title || "—"}</div>
              </div>

              <div className="learner-profile-field">
                <label>RCVD Registration Number</label>
                <div>{user.rcvd_registration_number || "—"}</div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="learner-profile-section">
            <div className="learner-profile-section-title">
              <i className="bi bi-shield-check"></i>
              <h3>Account Information</h3>
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
        </div>
      </div>
    </div>
  );
};

export default LearnerProfile;
