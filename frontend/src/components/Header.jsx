import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import burgerOn from "./images/burger-on.png";
import burgerOff from "./images/burger-off.png";
import logo from "./images/logo.png";

import "./css/Header.css";

const Header = () => {
  const [isOn, setIsOn] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

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
              {t("navigation.courses")}
            </Link>

            <Link to="/instructors" className="link">
              {t("navigation.instructors")}
            </Link>

            <Link to="/about" className="link">
              {t("navigation.about")}
            </Link>

            <Link to="/help" className="link">
              {t("navigation.help")}
            </Link>

            {/* Language Selector */}
            <div className="language-selector">
              <i className="bi bi-translate"></i>

              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t("common.language")}
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="rw">RW</option>
              </select>
            </div>

            {user ? (
              <>
                <Link to={getDashboardPath()} className="link user-name">
                  {t("common.welcome")}, {user.first_name}
                </Link>

                <button
                  className="link logout-btn"
                  onClick={() => setShowLogoutModal(true)}
                >
                  {t("navigation.logout")}
                </button>
              </>
            ) : (
              <Link to="/login" className="link login">
                {t("navigation.login")}
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
              {t("navigation.courses")}
            </Link>

            <Link
              to="/instructors"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-people me-2"></i>
              {t("navigation.instructors")}
            </Link>

            {!user && (
              <Link
                to="/register"
                className="phone-navbar-link mobile-get-started"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-person-plus me-2"></i>
                {t("navigation.getStarted")}
              </Link>
            )}

            <Link
              to="/help"
              className="phone-navbar-link"
              onClick={closeMobileMenu}
            >
              <i className="bi bi-headset me-2"></i>
              {t("navigation.help")}
            </Link>

            {/* Mobile Language Selector */}
            <div className="mobile-language-selector">
              <i className="bi bi-translate me-2"></i>

              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t("common.language")}
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
                  {t("common.welcome")}, {user.first_name}
                </Link>

                <button
                  className="phone-logout-btn"
                  onClick={() => {
                    closeMobileMenu();
                    setShowLogoutModal(true);
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  {t("navigation.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="phone-login"
                onClick={closeMobileMenu}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                {t("navigation.login")}
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

            <h3>{t("auth.confirmLogout")}</h3>

            <p>{t("auth.logoutMessage")}</p>

            <div className="modal-buttons">
              <button
                className="btn cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                {t("common.cancel")}
              </button>

              <button className="btn logout-confirm-btn" onClick={handleLogout}>
                {t("navigation.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
