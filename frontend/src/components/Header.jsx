import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import burgerOn from "./images/burger-on.png";
import burgerOff from "./images/burger-off.png";
import logo from "./images/logo.png";

import "./css/Header.css";

const Header = () => {
  const [isOn, setIsOn] = useState(true);
  const navigate = useNavigate();

  // Check logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="menu">
      <div className="logo">
        <img src={logo} className="logo-img" alt="Logo" />
      </div>

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
                <button className="phone-navbar-link logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="phone-navbar-link">Login</Link>
            )}
          </div>
        </div>
      </div>

      <div className="navbar">
        <div className="links">
          <Link to="/courses" className="link">Courses</Link>
          <Link to="/instructors" className="link">Instructors</Link>
          <Link to="/about" className="link">About</Link>
          <Link to="/help" className="link">Helpℹ️</Link>
          {user ? (
            <>
              <span className="link user-name">Hi, {user.firstname}</span>
              <button className="link logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="link login">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
