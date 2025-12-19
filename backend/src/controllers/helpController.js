import nodemailer from "nodemailer";

export const sendHelpMessage = async (req, res) => {
  const { fullname, phone, email, message } = req.body;

  if (!fullname || !phone || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"RCVD E-learning" <${process.env.EMAIL_USER}>`,
      to: "florisngendahayo@gmail.com",
      subject: "RCVD E-learning | Help Request",
      html: `
        <h3>New Help Request</h3>
        <p><strong>Full Name:</strong> ${fullname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully" });
    console.log("Okay");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
