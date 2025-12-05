import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import "./css/Courses.css"; // import the styles

const About = () => {
  return (
    <div className="courses-container">
        <p>
            Welcome to eLearning!
        </p>
        <p>
            RCVD eLearning is the official online platform of the Rwanda Council of Veterinary Doctors (RCVD), designed specifically for veterinarians and animal health professionals. Our platform allows experienced facilitators to upload high-quality courses covering the latest veterinary practices, clinical skills, and continuing education topics.
        </p>
        <p>
            Veterinarians can explore a wide range of courses, learn at their own pace, and test their knowledge through assessments after completing each course. Upon successfully completing a course, participants receive a certificate of achievement, officially recognized by RCVD, validating their skills and knowledge.
        </p>
        <p>
            Our mission is to make professional development accessible, practical, and engaging, empowering veterinarians to stay up-to-date with the latest advancements in animal care. Whether you’re looking to enhance your clinical skills, gain new certifications, or expand your knowledge, RCVD eLearning provides a structured and interactive environment to support your growth.
      </p>
      <hr />
      <p>
        <i>Join our community of veterinary professionals and advance your expertise with RCVD today!</i>
      </p>
    </div>
  );
};

export default About;
