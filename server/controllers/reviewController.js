const Review = require('../models/Review');
const Listing = require('../models/Listing');

// Add a review to a listing
exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, cleanliness, accuracy, communication, location, checkIn, value } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const review = new Review({
      author: req.user._id,
      listing: id,
      rating: Number(rating) || 5,
      comment,
      ratingsBreakdown: {
        cleanliness: Number(cleanliness) || 5,
        accuracy: Number(accuracy) || 5,
        communication: Number(communication) || 5,
        location: Number(location) || 5,
        checkIn: Number(checkIn) || 5,
        value: Number(value) || 5,
      },
    });

    await review.save();

    // Attach review to listing
    listing.reviews.push(review._id);

    // Recalculate average rating
    const allReviews = await Review.find({ listing: id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    listing.rating = Number(avgRating.toFixed(2));
    listing.reviewCount = allReviews.length;
    await listing.save();

    const populatedReview = await Review.findById(review._id).populate('author', 'name avatar createdAt');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    // Recalculate rating
    const allReviews = await Review.find({ listing: id });
    const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 5.0;

    await Listing.findByIdAndUpdate(id, {
      rating: Number(avgRating.toFixed(2)),
      reviewCount: allReviews.length,
    });

    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
