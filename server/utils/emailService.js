const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendRegistrationEmail = async (email, fullName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration missing. Please check your .env file');
    throw new Error('Email configuration missing');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Registration Successful - Academic Affairs Central Team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Registration Successful!</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for registering with us. Your application has been successfully submitted.</p>
        <p>Our team will review your application and connect with you soon.</p>
        <p>Best regards,<br>Academic Affairs Central Team</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Detailed email error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  sendRegistrationEmail
}; 