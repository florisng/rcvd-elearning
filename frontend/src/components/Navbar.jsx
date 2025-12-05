import React from "react";

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: "#2c3e50",
      padding: "20px",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <h3 style={{ margin: 0 }}>RCVD - E-learning</h3>
      <div>
        <a href="/" style={{ color: "#fff", marginRight: "16px", textDecoration: "none" }}>Courses</a>
        <a href="/about" style={{ color: "#fff", textDecoration: "none" }}>About</a>
      </div>
    </nav>
  );
};

export default Navbar;
