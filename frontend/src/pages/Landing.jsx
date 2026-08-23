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
          <div className="landing-badge">RCVD E-LEARNING PLATFORM</div>

          <h1>
            Advancing
            <span>Veterinary Excellence</span>
            in Rwanda
          </h1>

          <p>
            Access high-quality professional education designed for
            veterinarians and veterinary professionals in Rwanda. Learn from
            experienced instructors, develop your skills, and stay up to date
            with the latest knowledge in veterinary medicine.
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
              src="/images/rwanda-veterinary.JPG"
              alt="Veterinary professionals working with animals in Rwanda"
              className="hero-veterinary-image"
            />

            <div className="hero-image-caption">
              <strong>Veterinary Education</strong>
              <span>Building stronger veterinary professionals in Rwanda</span>
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

          <h2>Professional learning for veterinary excellence</h2>

          <p>
            Develop your knowledge and professional skills through structured
            courses created specifically for veterinary professionals.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-book-half"></i>
            </div>

            <h3>Professional Courses</h3>

            <p>
              Access carefully developed courses covering important areas of
              veterinary medicine, animal health and professional practice.
            </p>
          </div>

          {/* Feature 2 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-person-video3"></i>
            </div>

            <h3>Experienced Instructors</h3>

            <p>
              Learn from qualified veterinary professionals and experienced
              instructors with practical knowledge from the field.
            </p>
          </div>

          {/* Feature 3 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-award"></i>
            </div>

            <h3>Learn & Get Certified</h3>

            <p>
              Complete your courses, take assessments and demonstrate your
              knowledge through professional certification.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CALL TO ACTION
      ===================================================== */}

      <section className="landing-cta">
        <div>
          <h2>Ready to advance your veterinary career?</h2>

          <p>
            Explore our courses and start learning today with RCVD E-Learning.
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
