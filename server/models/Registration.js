const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // Student Details
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  uid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  // Previous Experience
  leadershipRoles: {
    type: String,
    required: true
  },
  majorEvents: {
    type: String,
    required: true
  },
  teamStrategy: {
    type: String,
    required: true
  },
  multitaskingAbility: {
    type: String,
    required: true
  },

  // Academic Info
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  resume: {
    type: String, // Store the file path
    required: true
  },

  // Terms & Conditions
  terms: {
    type: [Boolean],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4 && v.every(term => term === true);
      },
      message: 'All terms must be accepted'
    }
  },

  // Additional fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema); 