// Email Notification Service
// Path: src/backend/services/notificationService.js
// Purpose: Handle all email notifications for GymCrush

import { sendEmail } from './emailService.js';
import User from '../models/User.js';

// Email templates for notifications
const notificationTemplates = {
  // 1. Crush received notification
  crushReceived: (senderName, recipientName) => ({
    subject: '💪 Someone has a crush on you at GymCrush!',
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
            .sender-info {
              background-color: #F2F2F7;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #32FF6A;
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
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #8E8E93;
            }
            .unsubscribe {
              font-size: 12px;
              color: #8E8E93;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💪❤️</div>
            <h2>Hey ${recipientName}!</h2>
            <p style="font-size: 16px;">Someone thinks you're their perfect workout partner!</p>
            
            <div class="sender-info">
              <h3 style="color: #0A0F3D; margin-top: 0;">${senderName} sent you a crush! 🔥</h3>
              <p>They're interested in getting to know you better. Check out their profile and see if you feel the chemistry too!</p>
            </div>
            
            <p><strong>When you both send crushes, you'll match and can start chatting!</strong></p>
            
            <a href="${process.env.CLIENT_URL}/crushes" class="button">View Your Crushes</a>
            
            <div class="footer">
              <p><strong>Time to make some gains in love! 💪</strong></p>
              <hr style="border: none; border-top: 1px solid #F2F2F7; margin: 20px 0;">
              <p>© 2024 GymCrush - Where Strength Meets Chemistry</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #8E8E93;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hey ${recipientName}!
      
      Someone thinks you're their perfect workout partner!
      
      ${senderName} sent you a crush! 🔥
      
      They're interested in getting to know you better. Check out their profile and see if you feel the chemistry too!
      
      When you both send crushes, you'll match and can start chatting!
      
      View your crushes at: ${process.env.CLIENT_URL}/crushes
      
      Time to make some gains in love!
      
      © 2024 GymCrush - Where Strength Meets Chemistry
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  }),

  // 2. New message notification
  newMessage: (senderName, recipientName, messagePreview) => ({
    subject: `💬 New message from ${senderName}`,
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
            .message-preview {
              background-color: #F2F2F7;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
              border-left: 4px solid #32FF6A;
            }
            .sender-name {
              color: #FF3B30;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .message-text {
              color: #0A0F3D;
              font-style: italic;
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
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #8E8E93;
            }
            .unsubscribe {
              font-size: 12px;
              color: #8E8E93;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💬💪</div>
            <h2>Hey ${recipientName}!</h2>
            <p>You've got a new message waiting!</p>
            
            <div class="message-preview">
              <div class="sender-name">${senderName}</div>
              <div class="message-text">"${messagePreview}"</div>
            </div>
            
            <p><strong>Keep the conversation pumping!</strong></p>
            
            <a href="${process.env.CLIENT_URL}/messages" class="button">Read Message</a>
            
            <div class="footer">
              <p>Don't leave them on read! 🏃‍♂️</p>
              <hr style="border: none; border-top: 1px solid #F2F2F7; margin: 20px 0;">
              <p>© 2024 GymCrush - Where Strength Meets Chemistry</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #8E8E93;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hey ${recipientName}!
      
      You've got a new message waiting!
      
      ${senderName}: "${messagePreview}"
      
      Keep the conversation pumping!
      
      Read your message at: ${process.env.CLIENT_URL}/messages
      
      Don't leave them on read!
      
      © 2024 GymCrush - Where Strength Meets Chemistry
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  }),

  // 3. Mutual crushes (match) notification
  mutualCrushes: (matchName, recipientName) => ({
    subject: '🔥 IT\'S A MATCH! You\'ve got a new GymCrush!',
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
              font-size: 72px;
              margin-bottom: 20px;
              animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            h2 {
              color: #FF3B30;
              margin-bottom: 20px;
              font-size: 32px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: -1px;
            }
            .match-info {
              background-color: #F2F2F7;
              border-radius: 10px;
              padding: 25px;
              margin: 20px 0;
              border: 3px solid #32FF6A;
            }
            .match-name {
              color: #FF3B30;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #FF3B30 0%, #FF2D95 100%);
              color: white;
              padding: 16px 36px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
            }
            .celebration {
              font-size: 20px;
              color: #32FF6A;
              margin: 15px 0;
              font-weight: 600;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #8E8E93;
            }
            .unsubscribe {
              font-size: 12px;
              color: #8E8E93;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💪❤️🔥</div>
            <h2>IT'S A MATCH!</h2>
            <p class="celebration">Your crushes aligned perfectly!</p>
            
            <div class="match-info">
              <div class="match-name">You matched with ${matchName}! 🎉</div>
              <p>You both sent each other crushes - that's what we call perfect form!</p>
              <p style="margin-top: 15px;"><strong>Time to spot each other in conversation!</strong></p>
            </div>
            
            <p>Break the ice! Send the first message and see where this workout partnership leads.</p>
            
            <a href="${process.env.CLIENT_URL}/messages" class="button">Start Chatting</a>
            
            <div class="footer">
              <p><strong>May your connection be as strong as your squats! 💪</strong></p>
              <hr style="border: none; border-top: 1px solid #F2F2F7; margin: 20px 0;">
              <p>© 2024 GymCrush - Where Strength Meets Chemistry</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #8E8E93;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      IT'S A MATCH!
      
      ${recipientName}, your crushes aligned perfectly!
      
      You matched with ${matchName}! 🎉
      
      You both sent each other crushes - that's what we call perfect form!
      
      Time to spot each other in conversation!
      
      Break the ice! Send the first message and see where this workout partnership leads.
      
      Start chatting at: ${process.env.CLIENT_URL}/messages
      
      May your connection be as strong as your squats!
      
      © 2024 GymCrush - Where Strength Meets Chemistry
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  }),

  // 4. Low crush balance notification
  lowCrushBalance: (recipientName, currentBalance) => ({
    subject: '🏋️ Your crush balance is running low',
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
            .balance-info {
              background-color: #F2F2F7;
              border-radius: 10px;
              padding: 25px;
              margin: 20px 0;
              border: 2px solid #FF3B30;
            }
            .balance-number {
              font-size: 48px;
              color: #FF3B30;
              font-weight: bold;
              margin: 10px 0;
            }
            .balance-label {
              color: #8E8E93;
              font-size: 18px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .options {
              margin: 30px 0;
            }
            .option {
              background-color: #F2F2F7;
              border-radius: 10px;
              padding: 15px;
              margin: 10px 0;
              border: 1px solid #E0E0E0;
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
            }
            .button-secondary {
              background: #32FF6A;
              color: #0A0F3D;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              display: inline-block;
              margin: 5px;
              text-transform: uppercase;
              font-size: 12px;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #8E8E93;
            }
            .unsubscribe {
              font-size: 12px;
              color: #8E8E93;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🏋️💔</div>
            <h2>Hey ${recipientName}!</h2>
            <p style="font-size: 16px;">Your crush supply is running low!</p>
            
            <div class="balance-info">
              <div class="balance-label">Current Balance</div>
              <div class="balance-number">${currentBalance}</div>
              <div class="balance-label">crushes remaining</div>
            </div>
            
            <p><strong>Don't let your love gains plateau! Here are your options:</strong></p>
            
            <div class="options">
              <div class="option">
                <strong>💪 GO UNLIMITED</strong>
                <p>Never run out of crushes with our monthly membership</p>
                <a href="${process.env.CLIENT_URL}/profile#crushes" class="button-secondary">Learn More</a>
              </div>
              
              <div class="option">
                <strong>🔥 GET MORE CRUSHES</strong>
                <p>Choose from our crush packages starting at just $4.99</p>
                <a href="${process.env.CLIENT_URL}/profile#crushes" class="button-secondary">View Packages</a>
              </div>
            </div>
            
            <a href="${process.env.CLIENT_URL}/profile#crushes" class="button">Power Up Now</a>
            
            <div class="footer">
              <p><strong>Keep the momentum going! 🚀</strong></p>
              <hr style="border: none; border-top: 1px solid #F2F2F7; margin: 20px 0;">
              <p>© 2024 GymCrush - Where Strength Meets Chemistry</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #8E8E93;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hey ${recipientName}!
      
      Your crush supply is running low!
      
      Current Balance: ${currentBalance} crushes remaining
      
      Don't let your love gains plateau! Here are your options:
      
      1. GO UNLIMITED - Never run out of crushes with our monthly membership
      2. GET MORE CRUSHES - Choose from our crush packages starting at just $4.99
      
      Power up at: ${process.env.CLIENT_URL}/profile#crushes
      
      Keep the momentum going!
      
      © 2024 GymCrush - Where Strength Meets Chemistry
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  })
};

// Notification service functions
const notificationService = {
  // 1. Send crush received notification
  sendCrushReceivedNotification: async (senderId, recipientId) => {
    try {
      const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('username'),
        User.findById(recipientId).select('username email profile.notifications')
      ]);

      if (!sender || !recipient) {
        console.error('Users not found for crush notification');
        return { success: false, error: 'Users not found' };
      }

      // Check if user has email notifications enabled (default to true if not set)
      if (recipient.profile?.notifications?.emailEnabled === false) {
        return { success: false, error: 'User has disabled email notifications' };
      }

      // Check specific notification preference
      if (recipient.profile?.notifications?.crushReceived === false) {
        return { success: false, error: 'User has disabled crush notifications' };
      }

      const template = notificationTemplates.crushReceived(sender.username, recipient.username);
      
      return await sendEmail({
        to: recipient.email,
        ...template
      });
    } catch (error) {
      console.error('Error sending crush received notification:', error);
      return { success: false, error: error.message };
    }
  },

  // 2. Send new message notification
  sendNewMessageNotification: async (senderId, recipientId, messageContent) => {
    try {
      const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('username'),
        User.findById(recipientId).select('username email profile.notifications')
      ]);

      if (!sender || !recipient) {
        console.error('Users not found for message notification');
        return { success: false, error: 'Users not found' };
      }

      // Check if user has email notifications enabled
      if (recipient.profile?.notifications?.emailEnabled === false) {
        return { success: false, error: 'User has disabled email notifications' };
      }

      // Check specific notification preference
      if (recipient.profile?.notifications?.newMessage === false) {
        return { success: false, error: 'User has disabled message notifications' };
      }

      // Truncate message for preview (max 100 characters)
      const messagePreview = messageContent.length > 100 
        ? messageContent.substring(0, 97) + '...' 
        : messageContent;

      const template = notificationTemplates.newMessage(
        sender.username, 
        recipient.username, 
        messagePreview
      );
      
      return await sendEmail({
        to: recipient.email,
        ...template
      });
    } catch (error) {
      console.error('Error sending message notification:', error);
      return { success: false, error: error.message };
    }
  },

  // 3. Send mutual crushes (match) notification
  sendMatchNotification: async (user1Id, user2Id) => {
    try {
      const [user1, user2] = await Promise.all([
        User.findById(user1Id).select('username email profile.notifications'),
        User.findById(user2Id).select('username email profile.notifications')
      ]);

      if (!user1 || !user2) {
        console.error('Users not found for match notification');
        return { success: false, error: 'Users not found' };
      }

      const results = [];

      // Send notification to user1 if enabled
      if (user1.profile?.notifications?.emailEnabled !== false && 
          user1.profile?.notifications?.newMatch !== false) {
        const template1 = notificationTemplates.mutualCrushes(user2.username, user1.username);
        const result1 = await sendEmail({
          to: user1.email,
          ...template1
        });
        results.push(result1);
      }

      // Send notification to user2 if enabled
      if (user2.profile?.notifications?.emailEnabled !== false &&
          user2.profile?.notifications?.newMatch !== false) {
        const template2 = notificationTemplates.mutualCrushes(user1.username, user2.username);
        const result2 = await sendEmail({
          to: user2.email,
          ...template2
        });
        results.push(result2);
      }

      return { 
        success: results.every(r => r.success), 
        results 
      };
    } catch (error) {
      console.error('Error sending match notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // 4. Send low crush balance notification
  sendLowCrushBalanceNotification: async (userId) => {
    try {
      const user = await User.findById(userId).select('username email crushes.available profile.notifications');

      if (!user) {
        console.error('User not found for low balance notification');
        return { success: false, error: 'User not found' };
      }

      // Check if user has email notifications enabled
      if (user.profile?.notifications?.emailEnabled === false) {
        return { success: false, error: 'User has disabled email notifications' };
      }

      // Check specific notification preference (using premiumExpiring as it's related)
      if (user.profile?.notifications?.premiumExpiring === false) {
        return { success: false, error: 'User has disabled balance notifications' };
      }

      // Only send if balance is below 5
      if (user.crushes.available >= 5) {
        return { success: false, error: 'Crush balance is not low' };
      }

      const template = notificationTemplates.lowCrushBalance(
        user.username, 
        user.crushes.available
      );
      
      return await sendEmail({
        to: user.email,
        ...template
      });
    } catch (error) {
      console.error('Error sending low balance notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Check and send low balance notification after crush usage
  checkAndSendLowBalanceNotification: async (userId, newBalance) => {
    try {
      // Only send notification if balance just dropped below 5
      if (newBalance < 5 && newBalance >= 0) {
        // Check if we've already sent a notification recently (within 24 hours)
        const user = await User.findById(userId).select('profile.lastPremiumExpiringNotification');
        
        if (user?.profile?.lastPremiumExpiringNotification) {
          const lastNotification = new Date(user.profile.lastPremiumExpiringNotification);
          const hoursSinceLastNotification = (Date.now() - lastNotification) / (1000 * 60 * 60);
          
          if (hoursSinceLastNotification < 24) {
            return { success: false, error: 'Notification sent recently' };
          }
        }

        // Send notification and update last notification timestamp
        const result = await notificationService.sendLowCrushBalanceNotification(userId);
        
        if (result.success) {
          await User.findByIdAndUpdate(userId, {
            'profile.lastPremiumExpiringNotification': new Date()
          });
        }
        
        return result;
      }
      
      return { success: false, error: 'Balance not in notification range' };
    } catch (error) {
      console.error('Error checking low balance notification:', error);
      return { success: false, error: error.message };
    }
  }
};

export default notificationService;