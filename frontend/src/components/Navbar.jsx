import React from "react";
import { Link } from "react-router-dom";
import "./css/NavBar.css";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/courses" className="nav-link">Courses</Link>
        <Link to="/instructors" className="nav-link">Instructors</Link>
        <Link to="/about" className="nav-link">About</Link>
      </div>
      <div className="navbar-right">
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    </nav>
  );
};

export default NavBar;
