const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  leadership: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  priorExperience: {
    type: Number,
    min: 0,
    max: 15,
    default: 0
  },
  discipline: {
    type: Number,
    min: 0,
    max: 15,
    default: 0
  },
  academics: {
    type: Number,
    min: 0,
    max: 15,
    default: 0
  },
  attitude: {
    type: Number,
    min: 0,
    max: 15,
    default: 0
  },
  timeManagement: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  result: {
    type: String,
    enum: ['', 'selected', 'notSelected'],
    default: ''
  },
  evaluatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Evaluation', evaluationSchema); 