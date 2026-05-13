const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify workout type'],
      enum: [
        'running',
        'walking',
        'cycling',
        'swimming',
        'weightlifting',
        'strength',
        'yoga',
        'hiit',
        'cardio',
        'stretching',
        'sports',
        'other',
      ],
    },
    name: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide workout duration'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
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

workoutSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);
