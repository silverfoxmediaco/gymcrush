// Email Service
// Path: src/backend/services/emailService.js
// Purpose: Handle all email sending functionality

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For Gmail (requires app-specific password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App-specific password
      },
    });
  }
  
  // For SendGrid
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // For development/testing with Mailtrap
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransporter({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }
  
  // Default SMTP configuration
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  passwordReset: (resetUrl, username) => ({
    subject: '💪 Reset Your GymCrush Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Poppins', 'Arial', sans-serif;
              line-height: 1.6;
              color: #0A0F3D;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F2F2F7;
            }
            .container {
              background-color: #FFFFFF;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(10, 15, 61, 0.1);
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h2 {
              color: #FF3B30;
              margin-bottom: 20px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            .button {
              display: inline-block;
              background: #FF3B30;
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.3s ease;
            }
            .button:hover {
              background: #E5342A;
              transform: scale(1.02);
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #8E8E93;
            }
            .warning {
              background-color: #FFF3CD;
              border: 2px solid #32FF6A;
              color: #0A0F3D;
              padding: 12px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💪🔥</div>
            <h2>Hey ${username}!</h2>
            <p style="font-size: 16px;">Ready to get back in the game?</p>
            <p>We received a request to reset your GymCrush password. Click below to create a new one:</p>
            
            <a href="${resetUrl}" class="button">Reset My Password</a>
            
            <p style="margin-top: 20px; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <span style="color: #FF3B30; word-break: break-all;">${resetUrl}</span>
            </p>
            
            <div class="warning">
              ⏰ This link will expire in 1 hour - just like those post-workout gains if you don't refuel!
            </div>
            
            <div class="footer">
              <p>If you didn't request this password reset, no worries - just ignore this email.</p>
              <p>Your password won't be changed until you create a new one.</p>
              <hr style="border: none; border-top: 1px solid #F2F2F7; margin: 20px 0;">
              <p><strong>Keep crushing it!</strong></p>
              <p>© 2024 GymCrush - Where Strength Meets Chemistry 💪</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hey ${username}!
      
      Ready to get back in the game?
      
      We received a request to reset your GymCrush password.
      
      Click this link to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour - just like those post-workout gains if you don't refuel!
      
      If you didn't request this password reset, no worries - just ignore this email.
      Your password won't be changed until you create a new one.
      
      Keep crushing it!
      
      © 2024 GymCrush - Where Strength Meets Chemistry
    `
  }),
  
  welcome: (username) => ({
    subject: '💪 Welcome to GymCrush!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Poppins', 'Arial', sans-serif;
              line-height: 1.6;
              color: #0A0F3D;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F2F2F7;
            }
            .container {
              background-color: #FFFFFF;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(10, 15, 61, 0.1);
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h2 {
              color: #FF3B30;
              margin-bottom: 20px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            .button {
              display: inline-block;
              background: #FF3B30;
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.3s ease;
            }
            .tips {
              background-color: #F2F2F7;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
              border-left: 4px solid #32FF6A;
            }
            .tip-item {
              margin: 12px 0;
              padding-left: 20px;
              font-weight: 500;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #8E8E93;
            }
            .highlight {
              color: #FF3B30;
              font-weight: 700;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💪🔥</div>
            <h2>Welcome to GymCrush, ${username}!</h2>
            <p style="font-size: 16px;">You're now part of the hottest fitness dating community!</p>
            
            <div class="tips">
              <h3 style="color: #0A0F3D;">Time to flex those profile muscles:</h3>
              <div class="tip-item">🏋️ <strong>Complete your profile</strong> - Show off your fitness journey</div>
              <div class="tip-item">📸 <strong>Add photos</strong> - Let them see those gains</div>
              <div class="tip-item">🔍 <strong>Browse profiles</strong> - Find your perfect workout partner</div>
              <div class="tip-item">💕 <strong>Send crushes</strong> - Make your move!</div>
            </div>
            
            <p>You've got <span class="highlight">5 FREE CRUSHES</span> to start making connections!</p>
            
            <a href="${process.env.CLIENT_URL}/profile" class="button">Complete My Profile</a>
            
            <div class="footer">
              <p><strong>Ready to find your swolemate? Let's go! 🚀</strong></p>
              <hr style="border: none; border-top: 1px solid #F2F2F7; margin: 20px 0;">
              <p>© 2024 GymCrush - Where Strength Meets Chemistry</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to GymCrush, ${username}!
      
      You're now part of the hottest fitness dating community!
      
      Time to flex those profile muscles:
      - Complete your profile - Show off your fitness journey
      - Add photos - Let them see those gains
      - Browse profiles - Find your perfect workout partner
      - Send crushes - Make your move!
      
      You've got 5 FREE CRUSHES to start making connections!
      
      Visit ${process.env.CLIENT_URL}/profile to complete your profile.
      
      Ready to find your swolemate? Let's go!
      
      © 2024 GymCrush - Where Strength Meets Chemistry
    `
  })
};

// Main email sending function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    
    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'GymCrush'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendPasswordResetEmail = async (email, resetUrl, username) => {
  const template = emailTemplates.passwordReset(resetUrl, username);
  return await sendEmail({
    to: email,
    ...template
  });
};

const sendWelcomeEmail = async (email, username) => {
  const template = emailTemplates.welcome(username);
  return await sendEmail({
    to: email,
    ...template
  });
};

// THIS IS THE CRUCIAL PART YOU'RE MISSING!
module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};