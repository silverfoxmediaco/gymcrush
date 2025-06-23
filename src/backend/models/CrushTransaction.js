// CrushTransaction Model
// Path: src/backend/models/CrushTransaction.js
// Purpose: Track all crush account and subscription-related transactions

const mongoose = require('mongoose');

const crushTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['subscription_started', 'subscription_renewed', 'subscription_cancelled', 'subscription_failed', 'bonus', 'refund', 'system'],
    index: true
  },
  subscriptionTier: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    required: false
  },
  change: {
    type: String,
    required: true,
    // 'activated', 'deactivated', 'upgraded', 'downgraded'
    enum: ['activated', 'deactivated', 'upgraded', 'downgraded', 'renewed', 'bonus_applied', 'refunded']
  },
  statusAfter: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'premium', 'elite']
  },
  description: {
    type: String,
    required: false,
    maxLength: 500
  },
  // Stripe-related fields for subscriptions
  stripeSessionId: {
    type: String,
    required: false,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: false,
    index: true
  },
  paymentAmount: {
    type: Number,
    required: false,
    // Amount paid in dollars (not cents)
  },
  subscriptionDetails: {
    plan: {
      type: String,
      enum: ['monthly', 'yearly']
    },
    tier: {
      type: String,
      enum: ['basic', 'premium', 'elite']
    },
    periodStart: Date,
    periodEnd: Date,
    features: [String] // List of features included in this tier
  },
  // Admin tracking
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    // For bonus/refund transactions added by admin
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    // Additional data like promo codes, special offers, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
crushTransactionSchema.index({ userId: 1, createdAt: -1 });
crushTransactionSchema.index({ userId: 1, type: 1 });
crushTransactionSchema.index({ stripeSubscriptionId: 1 });

// Static methods for common queries
crushTransactionSchema.statics.getUserCurrentStatus = async function(userId) {
  const lastTransaction = await this.findOne({ userId })
    .sort({ createdAt: -1 })
    .select('statusAfter subscriptionTier subscriptionDetails');
  
  if (!lastTransaction) {
    return { status: 'free', tier: null };
  }
  
  // Check if subscription is still active based on period end
  if (lastTransaction.subscriptionDetails?.periodEnd) {
    const now = new Date();
    if (now > lastTransaction.subscriptionDetails.periodEnd) {
      return { status: 'free', tier: null };
    }
  }
  
  return { 
    status: lastTransaction.statusAfter, 
    tier: lastTransaction.subscriptionTier,
    features: lastTransaction.subscriptionDetails?.features || [],
    periodEnd: lastTransaction.subscriptionDetails?.periodEnd
  };
};

crushTransactionSchema.statics.getSubscriptionHistory = async function(userId) {
  return await this.find({ 
    userId, 
    type: { $in: ['subscription_started', 'subscription_renewed', 'subscription_cancelled'] }
  })
  .sort({ createdAt: -1 })
  .select('type subscriptionTier subscriptionDetails paymentAmount createdAt');
};

crushTransactionSchema.statics.getTotalRevenue = async function(userId) {
  const result = await this.aggregate([
    { $match: { 
      userId: mongoose.Types.ObjectId(userId), 
      type: { $in: ['subscription_started', 'subscription_renewed'] },
      paymentAmount: { $exists: true }
    }},
    { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

crushTransactionSchema.statics.getActiveSubscribers = async function() {
  const now = new Date();
  
  const result = await this.aggregate([
    {
      $sort: { userId: 1, createdAt: -1 }
    },
    {
      $group: {
        _id: '$userId',
        lastTransaction: { $first: '$$ROOT' }
      }
    },
    {
      $match: {
        'lastTransaction.statusAfter': { $ne: 'free' },
        'lastTransaction.subscriptionDetails.periodEnd': { $gt: now }
      }
    },
    {
      $group: {
        _id: '$lastTransaction.subscriptionTier',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result;
};

// Instance methods
crushTransactionSchema.methods.getFormattedDate = function() {
  return this.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

crushTransactionSchema.methods.isActive = function() {
  if (this.statusAfter === 'free') return false;
  if (!this.subscriptionDetails?.periodEnd) return false;
  
  const now = new Date();
  return now < this.subscriptionDetails.periodEnd;
};

// Virtual for transaction action
crushTransactionSchema.virtual('action').get(function() {
  const actionMap = {
    'subscription_started': 'Started Subscription',
    'subscription_renewed': 'Renewed Subscription',
    'subscription_cancelled': 'Cancelled Subscription',
    'subscription_failed': 'Payment Failed',
    'bonus': 'Bonus Applied',
    'refund': 'Refunded',
    'system': 'System Action'
  };
  
  return actionMap[this.type] || this.type;
});

// Virtual for tier display
crushTransactionSchema.virtual('tierDisplay').get(function() {
  if (!this.subscriptionTier) return 'Free';
  return this.subscriptionTier.charAt(0).toUpperCase() + this.subscriptionTier.slice(1);
});

// Ensure virtuals are included in JSON
crushTransactionSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('CrushTransaction', crushTransactionSchema);