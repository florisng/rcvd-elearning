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

  const handleLogout = () => {
    setShowLogoutModal(false);        // ✅ close modal first
    localStorage.removeItem("user"); // ✅ logout

    // ✅ force navigation after state update
    setTimeout(() => {
      navigate("/login");
    }, 0);
  };

  return (
    <div className="menu">
      {/* Logo */}
      <div className="logo">
        <img src={logo} className="logo-img" alt="Logo" />
      </div>

      {/* Burger & Phone Menu */}
      <div className="burger-div">
        <div onClick={() => setIsOn(!isOn)} className="burger-wrapper">
          <img
            src={isOn ? burgerOn : burgerOff}
            className="burger-on"
            alt="Burger icon"
          />
        </div>

        <div className={`phone-menu ${isOn ? "hidden" : "show"}`}>
          <div className="phone-navbar">
            <Link to="/courses" className="phone-navbar-link">Courses</Link>
            <Link to="/instructors" className="phone-navbar-link">Instructors</Link>
            <Link to="/about" className="phone-navbar-link">About</Link>
            <Link to="/help" className="phone-navbar-link">Helpℹ️</Link>
            {user ? (
              <>
                <span className="phone-navbar-link">Hi, {user.firstname}</span>
                <button
                  className="btn logout-confirm-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="phone-navbar-link">Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navbar */}
      <div className="navbar">
        <div className="links">
          <Link to="/courses" className="link">Courses</Link>
          <Link to="/instructors" className="link">Instructors</Link>
          <Link to="/about" className="link">About</Link>
          <Link to="/help" className="link">Helpℹ️</Link>
          {user ? (
            <>
              <span className="link user-name">Hi, {user.firstname}</span>
              <button className="link logout-btn" onClick={() => setShowLogoutModal(true)}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="link login">Login</Link>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button className="btn cancel-btn" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn logout-confirm-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
