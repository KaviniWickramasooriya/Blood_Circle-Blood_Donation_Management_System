const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS  // your app password
      }
    });

    await transporter.sendMail({
      from: `"Blood Donation Service" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendEmail;
