import React, { useState } from "react";
import API_URL from "../api";
import "./css/Help.css";

const Help = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setStatus({
      submitted: false,
      success: false,
      message: "",
    });

    try {
      const res = await fetch(`${API_URL}/api/help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setStatus({
        submitted: true,
        success: true,
        message:
          "Thank you for contacting RCVD. Your message has been sent successfully. Our team will get back to you shortly.",
      });

      setFormData({
        fullname: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        submitted: true,
        success: false,
        message:
          "We were unable to send your message at this time. Please try again later or contact RCVD directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewMessage = () => {
    setStatus({
      submitted: false,
      success: false,
      message: "",
    });
  };

  return (
    <div className="help-page">
      <div className="help-container">
        {/* =========================================
            HEADER
        ========================================= */}

        <div className="help-header">
          <div className="help-icon">
            <i className="bi bi-headset"></i>
          </div>

          <span className="help-label">RCVD SUPPORT</span>

          <h1>How Can We Help You?</h1>

          <p>
            If you are experiencing an issue with the RCVD E-Learning Platform
            or need assistance, send us a message and our team will be happy to
            help.
          </p>
        </div>

        {/* =========================================
            CONTENT
        ========================================= */}

        <div className="help-content">
          {/* SUPPORT INFORMATION */}

          <div className="help-info">
            <div className="info-card">
              <div className="info-card-icon">
                <i className="bi bi-question-circle"></i>
              </div>

              <div>
                <h3>Platform Assistance</h3>

                <p>
                  Get help with registration, login, courses, learning progress,
                  tests, certificates, and other platform features.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <i className="bi bi-envelope"></i>
              </div>

              <div>
                <h3>Contact Support</h3>

                <p>
                  Complete the form and provide as much information as possible
                  so that our support team can assist you quickly.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <i className="bi bi-shield-check"></i>
              </div>

              <div>
                <h3>Professional Support</h3>

                <p>
                  Your request will be handled with care by the RCVD support
                  team.
                </p>
              </div>
            </div>
          </div>

          {/* =========================================
              FORM / SUCCESS MESSAGE
          ========================================= */}

          <div className="help-form-card">
            {status.submitted ? (
              <div
                className={`feedback-box ${
                  status.success ? "success" : "error"
                }`}
              >
                <div className="feedback-icon">
                  <i
                    className={
                      status.success
                        ? "bi bi-check-circle"
                        : "bi bi-exclamation-circle"
                    }
                  ></i>
                </div>

                <h2>
                  {status.success
                    ? "Message Sent Successfully"
                    : "Submission Failed"}
                </h2>

                <p>{status.message}</p>

                <button
                  type="button"
                  className="new-message-btn"
                  onClick={handleNewMessage}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <h2>Send Us a Message</h2>

                  <p>Fill in the form below and we'll get back to you.</p>
                </div>

                <form className="help-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullname">Full Name</label>

                      <div className="input-wrapper">
                        <i className="bi bi-person"></i>

                        <input
                          id="fullname"
                          type="text"
                          name="fullname"
                          placeholder="Enter your full name"
                          value={formData.fullname}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>

                      <div className="input-wrapper">
                        <i className="bi bi-telephone"></i>

                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>

                    <div className="input-wrapper">
                      <i className="bi bi-envelope"></i>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">How can we help?</label>

                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      placeholder="Describe the issue or question you need help with..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
