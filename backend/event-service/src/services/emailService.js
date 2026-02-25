const nodemailer = require("nodemailer");

const EMAIL = process.env.EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

// Function to send approval email to organizer
const sendApprovalEmail = (to, eventName) => {
  // Create reusable transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: APP_PASSWORD,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // Setup email data
  let mailOptions = {
    from: `"Blood Circle" <${EMAIL}>`, // Sender address
    to: to, // Recipient's email address
    subject: `Event "${eventName}" Approved!`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Approved - Blood Circle</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
          <tr>
            <td style="padding: 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #d32f2f, #b71c1c); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Blood Circle</h1>
                    <p style="margin: 5px 0 0; color: #ffebee; font-size: 16px;">Empowering Communities Through Blood Donation</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px; text-align: center;">Event Approval Notice</h2>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">Dear Organizer,</p>
                    <div style="background-color: #e8f5e8; border-left: 5px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 5px;">
                      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2e7d32; text-align: center;">Congratulations!</p>
                      <p style="margin: 10px 0 0; font-size: 16px; color: #388e3c; text-align: center;"><strong>"${eventName}"</strong> has been successfully approved by the admin.</p>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">You can now proceed with preparations and make a positive impact in your community. We're excited for your event!</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 20px auto;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="https://your-event-link.com" style="background-color: #4caf50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Event Details</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6c757d;">
                    <p style="margin: 0 0 10px;">Best regards,<br><strong>Blood Circle Team</strong></p>
                    <p style="margin: 0;">If you have any questions, contact us at <a href="mailto:support@bloodcircle.com" style="color: #d32f2f;">support@bloodcircle.com</a></p>
                    <p style="margin: 10px 0 0; font-size: 12px;">&copy; 2025 Blood Circle. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Dear Organizer,

Congratulations! Your event "${eventName}" has been successfully approved by the admin.

You can now proceed with preparations.

Best regards,
Blood Circle Team`
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error sending approval email to ${to}: ${error}`);
      // Note: In callback style, errors are not thrown; handle in controller if needed
    } else {
      console.log(`Approval email sent to ${to}: %s`, info.messageId);
    }
  });
};

// Function to send rejection email to organizer
const sendRejectionEmail = (toEmail, eventName, rejectionReason) => {
  // Create reusable transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: APP_PASSWORD,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // Setup email data
  let mailOptions = {
    from: `"Blood Circle" <${EMAIL}>`, // Sender address
    to: toEmail, // Recipient's email address
    subject: `Event "${eventName}" Rejected`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Rejected - Blood Circle</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
          <tr>
            <td style="padding: 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #d32f2f, #b71c1c); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Blood Circle</h1>
                    <p style="margin: 5px 0 0; color: #ffebee; font-size: 16px;">Empowering Communities Through Blood Donation</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px; text-align: center;">Event Rejection Notice</h2>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">Dear Organizer,</p>
                    <div style="background-color: #ffebee; border-left: 5px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 5px;">
                      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #c62828; text-align: center;">Unfortunately Rejected</p>
                      <p style="margin: 10px 0 0; font-size: 16px; color: #d32f2f; text-align: center;">Your event <strong>"${eventName}"</strong> has been reviewed and rejected.</p>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px; text-align: center;"><strong>Reason:</strong> ${rejectionReason || 'No specific reason provided'}</p>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">Please revise your submission and resubmit if you'd like to try again. We're here to support your efforts in community service.</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 20px auto;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="https://your-dashboard-link.com" style="background-color: #f44336; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Revise & Resubmit</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6c757d;">
                    <p style="margin: 0 0 10px;">Best regards,<br><strong>Blood Circle Team</strong></p>
                    <p style="margin: 0;">If you have any questions, contact us at <a href="mailto:support@bloodcircle.com" style="color: #d32f2f;">support@bloodcircle.com</a></p>
                    <p style="margin: 10px 0 0; font-size: 12px;">&copy; 2025 Blood Circle. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Dear Organizer,

Your event "${eventName}" has been rejected.

Reason: ${rejectionReason || 'No specific reason provided'}

Please revise and resubmit if you'd like to try again.

Best regards,
Blood Circle Team`
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error sending rejection email to ${toEmail}: ${error}`);
      // Note: In callback style, errors are not thrown; handle in controller if needed
    } else {
      console.log(`Rejection email sent to ${toEmail} for event "${eventName}": %s`, info.messageId);
    }
  });
};

module.exports = { sendApprovalEmail, sendRejectionEmail };