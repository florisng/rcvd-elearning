import React from "react";

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: "#2c3e50",
      padding: "16px",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <h1 style={{ margin: 0 }}>eLearning</h1>
      <div>
        <a href="/" style={{ color: "#fff", marginRight: "16px", textDecoration: "none" }}>Courses</a>
        <a href="/about" style={{ color: "#fff", textDecoration: "none" }}>About</a>
      </div>
    </nav>
  );
};

export default Navbar;
