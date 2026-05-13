const mongoose = require('mongoose');

const calorieSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      required: [true, 'Please specify meal type'],
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
    foodName: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Please provide calorie count'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    servingSize: {
      type: String,
      default: '1 serving',
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

calorieSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Calorie', calorieSchema);
