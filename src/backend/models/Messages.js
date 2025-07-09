// Message Model
// Path: src/backend/models/Messages.js
// Purpose: Define the Message schema for MongoDB

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.messageType === 'image';
    }
  },
  imagePublicId: {
    type: String,
    required: function() {
      return this.messageType === 'image';
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient conversation queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const messageDate = new Date(this.createdAt);
  const diffMs = now - messageDate;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return messageDate.toLocaleDateString();
});

// Static method to generate conversation ID
messageSchema.statics.getConversationId = function(userId1, userId2) {
  // Sort IDs to ensure consistent conversation ID regardless of who is sender/receiver
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to get conversation list for a user
messageSchema.statics.getConversationsForUser = async function(userId) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: mongoose.Types.ObjectId(userId) }, { receiver: mongoose.Types.ObjectId(userId) }],
        deleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$receiver', mongoose.Types.ObjectId(userId)] },
                { $eq: ['$read', false] }
              ]},
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'senderInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.receiver',
        foreignField: '_id',
        as: 'receiverInfo'
      }
    },
    {
      $project: {
        conversationId: '$_id',
        lastMessage: 1,
        unreadCount: 1,
        otherUser: {
          $cond: [
            { $eq: ['$lastMessage.sender', mongoose.Types.ObjectId(userId)] },
            { $arrayElemAt: ['$receiverInfo', 0] },
            { $arrayElemAt: ['$senderInfo', 0] }
          ]
        }
      }
    },
    {
      $project: {
        conversationId: 1,
        lastMessage: {
          content: 1,
          messageType: 1,
          createdAt: 1,
          sender: 1
        },
        unreadCount: 1,
        otherUser: {
          _id: 1,
          username: 1,
          'profile.photos': 1
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);

  return conversations;
};

// Instance method to mark as deleted
messageSchema.methods.softDelete = function(userId) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.model('Message', messageSchema);
