import React, { useState } from "react";
import { Link } from "react-router-dom";

import burgerOn from "./images/burger-on.png";
import burgerOff from "./images/burger-off.png";
import logo from "./images/logo.png";

import "./css/Header.css";

const Header = () => {
  const [isOn, setIsOn] = useState(true);

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
        {/* ✅ Only this part changed — phone-menu shows when isOn === false */}
        <div className={`phone-menu ${isOn ? "hidden" : "show"}`}>
          <div className="phone-navbar">
            <Link to="/courses" className="phone-navbar-link">Courses</Link>
            <Link to="/instructors" className="phone-navbar-link">Instructors</Link>
            <Link to="/login" className="phone-navbar-link">Login</Link>
            <Link to="/about" className="phone-navbar-link">About</Link>
            <Link to="/help" className="phone-navbar-link">Help</Link>
            <Link to="/help" className="phone-navbar-link">Helpℹ️</Link>
          </div>
        </div>
      {/* END OF CHANGE */}
      </div>

      <div className="navbar">
        <div className="links">
          <Link to="/courses" className="link">Courses</Link>
          <Link to="/instructors" className="link">Instructors</Link>
          <Link to="/login" className="link login">Login</Link>
          <Link to="/about" className="link">About</Link>
          <Link to="/help" className="link">Helpℹ️</Link>
        </div>
      </div>

    </div>
  );
};

export default Header;
