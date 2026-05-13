const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number, // in ml
      required: [true, 'Please provide water amount'],
      min: [0, 'Amount cannot be negative'],
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

waterSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Water', waterSchema);
