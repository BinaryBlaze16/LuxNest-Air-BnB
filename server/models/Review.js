const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    ratingsBreakdown: {
      cleanliness: { type: Number, default: 5, min: 1, max: 5 },
      accuracy: { type: Number, default: 5, min: 1, max: 5 },
      communication: { type: Number, default: 5, min: 1, max: 5 },
      location: { type: Number, default: 5, min: 1, max: 5 },
      checkIn: { type: Number, default: 5, min: 1, max: 5 },
      value: { type: Number, default: 5, min: 1, max: 5 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
