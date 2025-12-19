import React, { useState } from "react";
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      setStatus({
        submitted: true,
        success: false,
        message:
          "We were unable to send your message at this time. Please try again later or contact RCVD directly.",
      });
    }
  };

  return (
    <div className="help-page">
      <h1>Help & Support</h1>
      <p className="help-intro">
        If you are experiencing any issue with the RCVD E-learning platform,
        please contact us using the form below.
      </p>

      {/* ✅ FEEDBACK MESSAGE */}
      {status.submitted ? (
        <div
          className={`feedback-box ${
            status.success ? "success" : "error"
          }`}
        >
          <h3>{status.success ? "Message Sent" : "Submission Failed"}</h3>
          <p>{status.message}</p>
        </div>
      ) : (
        /* ✅ FORM */
        <form className="help-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};

export default Help;
