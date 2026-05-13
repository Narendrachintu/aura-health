const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sleepTime: {
      type: String,
      required: [true, 'Please provide sleep time'],
    },
    wakeTime: {
      type: String,
      required: [true, 'Please provide wake time'],
    },
    duration: {
      type: Number, // in hours
      required: [true, 'Please provide sleep duration'],
      min: [0, 'Duration cannot be negative'],
    },
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good',
    },
    notes: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

sleepSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Sleep', sleepSchema);
