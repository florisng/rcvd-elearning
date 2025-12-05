import React from "react";
import "./css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      &copy; {new Date().getFullYear()} RCVD eLearning. All rights reserved.
    </footer>
  );
};

export default Footer;
