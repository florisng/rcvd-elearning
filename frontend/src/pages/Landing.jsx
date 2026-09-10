import { Link } from "react-router-dom";
import "./css/Landing.css";
import { useTranslation } from "react-i18next";

function Landing() {
  const { t } = useTranslation();

  return (
    <div className="landing-page">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">{t("landing.badge")}</div>

          <h1>
            {t("landing.heroTitle")}
            <span>{t("landing.heroHighlight")}</span>
            {t("landing.heroLocation")}
          </h1>

          <p>{t("landing.heroDescription")}</p>

          <div className="landing-hero-buttons">
            <Link to="/courses" className="btn btn-primary">
              {t("landing.exploreCourses")}
            </Link>

            <Link to="/register" className="btn btn-outline-primary">
              {t("landing.getStarted")}
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
              alt={t("landing.heroImageAlt")}
              className="hero-veterinary-image"
            />

            <div className="hero-image-caption">
              <strong>{t("landing.imageTitle")}</strong>
              <span>{t("landing.imageCaption")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY RCVD E-LEARNING
      ===================================================== */}

      <section className="landing-features">
        <div className="landing-section-heading">
          <span>{t("landing.whyBadge")}</span>

          <h2>{t("landing.whyTitle")}</h2>

          <p>{t("landing.whyDescription")}</p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-book-half"></i>
            </div>

            <h3>{t("landing.featureCoursesTitle")}</h3>

            <p>{t("landing.featureCoursesDescription")}</p>
          </div>

          {/* Feature 2 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-person-video3"></i>
            </div>

            <h3>{t("landing.featureInstructorsTitle")}</h3>

            <p>{t("landing.featureInstructorsDescription")}</p>
          </div>

          {/* Feature 3 */}

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-award"></i>
            </div>

            <h3>{t("landing.featureCertificationTitle")}</h3>

            <p>{t("landing.featureCertificationDescription")}</p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CALL TO ACTION
      ===================================================== */}

      <section className="landing-cta">
        <div>
          <h1 className="white">{t("landing.ctaTitle")}</h1>

          <p>{t("landing.ctaDescription")}</p>
        </div>

        <Link to="/register" className="btn">
          {t("landing.getStarted")}
        </Link>
      </section>
    </div>
  );
}

export default Landing;
