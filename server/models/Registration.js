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
  cluster: {
    type: String,
    required: true,
    trim: true
  },
  institute: {
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

  // Experience
  leadershipRoles: {
    type: String,
    required: true
  },
  yourPosition: {
    type: String,
    required: true
  },
  otherPositionName: {
    type: String,
    required: false // Only required if 'Other Leadership Position' is selected
  },
  nameOfEntity: {
    type: String,
    required: true
  },
  sop: {
    type: String, // Store file path
    required: true
  },
  resume: {
    type: String, // Store the file path
    required: true
  },
  linkedinAccount: {
    type: String,
    required: true,
    trim: true
  },

  // Recommendation
  recommendationLetter: {
    type: String, // Store file path
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