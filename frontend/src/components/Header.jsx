import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

import burgerOn from "./images/burger-on.png";
import burgerOff from "./images/burger-off.png";
import logo from "./images/logo.png";

import "./css/Header.css";

const Header = () => {
  const { language, changeLanguage, t } = useLanguage();

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
              {t("courses")}
            </Link>

            <Link to="/instructors" className="link">
              {t("instructors")}
            </Link>

            <Link to="/about" className="link">
              {t("about")}
            </Link>

            <Link to="/help" className="link">
              {t("help")}
            </Link>

            <div className="language-selector">
              <i className="bi bi-translate"></i>

              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t("language")}
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="rw">RW</option>
              </select>
            </div>

            {user ? (
              <>
                <Link to={getDashboardPath()} className="link user-name">
                  Hi, {user.first_name}
                </Link>

                <button
                  className="link logout-btn"
                  onClick={() => setShowLogoutModal(true)}
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link to="/login" className="link login">
                {t("login")}
              </Link>
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
              {t("courses")}
            </Link>

            <Link
              to="/instructors"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-people me-2"></i>
              {t("instructors")}
            </Link>

            {!user && (
              <Link
                to="/register"
                className="phone-navbar-link mobile-get-started"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-person-plus me-2"></i>
                {t("getStarted")}
              </Link>
            )}

            <Link
              to="/help"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-headset me-2"></i>
              {t("help")}
            </Link>

            <div className="mobile-language-selector">
              <i className="bi bi-translate me-2"></i>

              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t("language")}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>

            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="phone-navbar-link"
                  onClick={closeMobileMenu}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {t("welcome")}, {user.first_name}
                </Link>

                <button
                  className="phone-logout-btn"
                  onClick={() => {
                    closeMobileMenu();
                    setShowLogoutModal(true);
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="phone-login"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                {t("login")}
              </Link>
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

            <p>
              Are you sure you want to log out of your RCVD E-Learning account?
            </p>

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
