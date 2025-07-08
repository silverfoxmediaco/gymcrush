// User.js
// Path: src/backend/models/User.js
// Purpose: Complete user model with all GymCrush features

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 18 && age <= 100;
      },
      message: 'You must be between 18 and 100 years old'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  crushBalance: {
    type: Number,
    default: 5
  },
  accountTier: {
    type: String,
    enum: ['free', 'basic', 'premium', 'elite'],
    default: 'free'
  },
  hasActiveSubscription: {
    type: Boolean,
    default: false
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'unpaid', null],
      default: null
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium', 'elite'],
      default: 'free'
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    cancelledAt: Date
  },
  profile: {
    age: {
      type: Number,
      min: 18,
      max: 100
    },
    gender: {
      type: String,
      enum: ['Man', 'Woman', 'Non-binary', 'Other']
    },
    height: String,
    bodyType: {
      type: String,
      enum: ['Slim', 'Athletic', 'Muscular', 'Fit', 'Toned', 'Average', 'Curvy', 'Full Figured', 'Prefer not to say']
    },
    location: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    locationType: {
      type: String,
      enum: ['device', 'manual', 'approximate'],
      default: 'manual'
    },
    bio: {
      type: String,
      maxlength: 500
    },
    interests: [{
      type: String,
      enum: [
        'Weightlifting', 'CrossFit', 'Running', 'Cycling', 'Swimming', 'Yoga',
        'Pilates', 'Boxing', 'MMA', 'Rock Climbing', 'Hiking', 'Dance',
        'Bodybuilding', 'Powerlifting', 'Olympic Lifting', 'Calisthenics',
        'HIIT', 'Spin Classes', 'Martial Arts', 'Tennis', 'Basketball',
        'Soccer', 'Volleyball', 'Nutrition', 'Meal Prep', 'Meditation',
        'Outdoor Activities', 'Adventure Sports', 'Functional Fitness',
        'Group Classes', 'Personal Training'
      ]
    }],
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'athlete'],
      default: 'intermediate'
    },
    gymFrequency: {
      type: String,
      enum: ['rarely', '1-2x_week', '3-4x_week', '5-6x_week', 'daily'],
      default: '3-4x_week'
    },
    lookingFor: {
      type: String,
      enum: ['Long-term relationship', 'Workout partner', 'Something casual', 'Not sure yet', 'New gym buddies']
    },
    photos: [{
      url: {
        type: String,
        required: true
      },
      thumbnailUrl: String,
      publicId: String,
      public_id: String, // Support both naming conventions
      isMain: {
        type: Boolean,
        default: false
      },
      displayMode: {
        type: String,
        enum: ['contain', 'cover'],
        default: 'contain'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    prompts: [{
      question: String,
      answer: {
        type: String,
        maxlength: 200
      }
    }]
  },
  crushes: {
    sent: [{
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }],
    received: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      receivedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Simplified references for easier querying
  crushesReceived: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  crushesSent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  filterPreferences: {
    minAge: {
      type: Number,
      default: 18,
      min: 18,
      max: 100
    },
    maxAge: {
      type: Number,
      default: 99,
      min: 18,
      max: 100
    },
    distance: {
      type: Number,
      default: 50,
      min: 1,
      max: 500
    },
    gender: [{
      type: String,
      enum: ['Men', 'Women', 'Non-binary', 'Everyone']
    }],
    heightMin: String,
    heightMax: String,
    interests: [String],
    lookingFor: [String],
    hasPhoto: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    emailEnabled: {
      type: Boolean,
      default: true
    },
    crushReceived: {
      type: Boolean,
      default: true
    },
    newMessage: {
      type: Boolean,
      default: true
    },
    newMatch: {
      type: Boolean,
      default: true
    },
    premiumExpiring: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  lastPremiumExpiringNotification: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual property to calculate age from dateOfBirth
userSchema.virtual('currentAge').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Update profile age whenever user is saved
userSchema.pre('save', async function(next) {
  // Update age from DOB
  if (this.dateOfBirth && this.profile) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.profile.age = age;
  }

  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'profile.location': 1 });
userSchema.index({ 'profile.interests': 1 });
userSchema.index({ 'profile.age': 1 });
userSchema.index({ createdAt: -1 });

// 2dsphere index is already created in the coordinates field definition

module.exports = mongoose.model('User', userSchema);