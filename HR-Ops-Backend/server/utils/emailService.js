const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS  // your app password
  }
});

/**
 * Send Email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML allowed)
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  SMTP credentials not configured. Logging email content instead:');
      console.log(`📧 To: ${to}`);
      console.log(`📄 Subject: ${subject}`);
      console.log(`📝 Content: ${html.replace(/<[^>]*>/g, '')}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"System Adminstrion" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

module.exports = { sendEmail };
