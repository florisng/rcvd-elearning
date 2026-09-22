import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import burgerOn from "./images/burger-on.png";
import burgerOff from "./images/burger-off.png";
import logo from "./images/logo.png";

import "./css/Header.css";

const Header = () => {
  const [isOn, setIsOn] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const getDashboardPath = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "LEARNER":
        return "/learner/dashboard";

      case "INSTRUCTOR":
        return "/instructor/dashboard";

      case "RCVD_ADMIN":
        return "/admin/dashboard";

      default:
        return "/courses";
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);

    localStorage.removeItem("user");

    setTimeout(() => {
      navigate("/login");
    }, 0);
  };

  const closeMobileMenu = () => {
    setIsOn(true);
  };

  return (
    <>
      <header className="menu">
        {/* =========================================
            LOGO
        ========================================= */}

        <div className="logo">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={logo} className="logo-img" alt="RCVD E-Learning" />
          </Link>
        </div>

        {/* =========================================
            DESKTOP NAVBAR
        ========================================= */}

        <nav className="navbar">
          <div className="links">
            <Link to="/courses" className="link">
              Courses
            </Link>

            <Link to="/instructors" className="link">
              Instructors
            </Link>

            {user?.role === "LEARNER" && (
              <Link to="/my-learning" className="link">
                My Learning
              </Link>
            )}

            <Link to="/help" className="link">
              Help
            </Link>

            {user ? (
              <div className="user-dropdown">
                <div className="user-name">
                  {user.first_name} - {user.role}
                  <i className="bi bi-chevron-down ms-1"></i>
                </div>

                <div className="user-dropdown-menu">
                  <Link to="/profile" className="user-dropdown-item">
                    <i className="bi bi-person-circle me-2"></i>
                    Profile
                  </Link>

                  <Link to={getDashboardPath()} className="user-dropdown-item">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>

                  <button
                    className="user-dropdown-item logout-dropdown-item"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-nav-actions">
                <Link to="/login" className="link login">
                  Login
                </Link>

                <Link to="/register" className="get-started-btn">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* =========================================
            MOBILE BURGER
        ========================================= */}

        <div className="burger-div">
          <button
            onClick={() => setIsOn(!isOn)}
            className="burger-wrapper"
            aria-label="Toggle navigation"
          >
            <img
              src={isOn ? burgerOn : burgerOff}
              className="burger-on"
              alt="Menu"
            />
          </button>
        </div>

        {/* =========================================
            MOBILE MENU
        ========================================= */}

        <div className={`phone-menu ${isOn ? "hidden" : "show"}`}>
          <nav className="phone-navbar">
            <Link
              to="/courses"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-journal-bookmark me-2"></i>
              Courses
            </Link>

            <Link
              to="/instructors"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-people me-2"></i>
              Instructors
            </Link>

            {user && (
              <Link
                to="/my-learning"
                className="phone-navbar-link"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-book me-2"></i>
                My Learning
              </Link>
            )}

            <Link
              to="/help"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-headset me-2"></i>
              Help
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="phone-navbar-link"
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Profile
                </Link>

                <Link
                  to={getDashboardPath()}
                  className="phone-navbar-link"
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>

                <button
                  className="phone-logout-btn"
                  onClick={() => {
                    closeMobileMenu();
                    setShowLogoutModal(true);
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="phone-login"
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>

                <Link
                  to="/register"
                  className="phone-get-started"
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* =========================================
          LOGOUT CONFIRMATION MODAL
      ========================================= */}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              <i className="bi bi-box-arrow-right"></i>
            </div>

            <h3>Confirm Logout</h3>

            <p>Are you sure you want to logout?</p>

            <div className="modal-buttons">
              <button
                className="btn cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button className="btn logout-confirm-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
