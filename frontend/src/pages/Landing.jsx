import { Link } from "react-router-dom";
import "./css/Landing.css";

function Landing() {
  return (
    <div className="landing-page">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">RCVD E-Learning Platform</div>

          <h1>
            Learn. Grow.
            <span> Get Certified.</span>
            <br />
            Anywhere in Rwanda.
          </h1>

          <p>
            Access quality veterinary education, learn from qualified
            instructors, complete your courses, take assessments, and earn
            professional certificates through the RCVD E-Learning Platform.
          </p>

          <div className="landing-hero-buttons">
            <Link to="/courses" className="btn btn-primary">
              Explore Courses
            </Link>

            <Link to="/register" className="btn btn-outline-primary">
              Get Started
            </Link>
          </div>
        </div>

        {/* =====================================================
            HERO IMAGE
        ===================================================== */}

        <div className="landing-hero-image">
          <div className="hero-image-placeholder">
            <img
              src="/images/rwanda-veterinary.jfif"
              alt="Veterinary professionals in Rwanda"
              className="hero-veterinary-image"
            />

            <div className="hero-image-caption">
              <strong>Veterinary Education</strong>
              <span>Learn and grow with RCVD E-Learning</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY RCVD E-LEARNING
      ===================================================== */}

      <section className="landing-features">
        <div className="landing-section-heading">
          <span>WHY RCVD E-LEARNING</span>

          <h2>Learn, Test and Get Certified</h2>

          <p>
            A convenient online learning platform designed to support veterinary
            professionals in continuing their education and professional
            development.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-book-half"></i>
            </div>

            <h3>Quality Courses</h3>

            <p>
              Access relevant veterinary courses and learn at your own pace from
              anywhere.
            </p>
          </div>

          {/* Feature 2 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-person-video3"></i>
            </div>

            <h3>Qualified Instructors</h3>

            <p>
              Learn from experienced professionals and instructors with relevant
              knowledge and expertise.
            </p>
          </div>

          {/* Feature 3 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-award"></i>
            </div>

            <h3>Professional Certification</h3>

            <p>
              Complete your learning and assessment requirements and receive
              your professional certificate through the platform.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CALL TO ACTION
      ===================================================== */}

      <section className="landing-cta">
        <div>
          <h1 className="white">Start Your Learning Journey</h1>

          <p>
            Explore available courses and take the next step in your
            professional development.
          </p>
        </div>

        <Link to="/register" className="btn">
          Get Started
        </Link>
      </section>
    </div>
  );
}

export default Landing;
