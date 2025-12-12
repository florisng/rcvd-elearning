import React, { useState } from "react";
import { Link } from "react-router-dom";

import burgerOn from "./images/burger-on.png";
import burgerOff from "./images/burger-off.png";
import logo from "./images/logo.jpg";

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
      </div>

      <div className="phone-menu">
        {/* Menu for phone here */}
      </div>

      <div className="navbar">
        <div className="links">
          <Link to="/courses" className="link">Courses</Link>
          <Link to="/instructors" className="link">Instructors</Link>
          <Link to="/about" className="link">About</Link>
          <Link to="/login" className="link login">Login</Link>
        </div>
      </div>

    </div>
  );
};

export default Header;
