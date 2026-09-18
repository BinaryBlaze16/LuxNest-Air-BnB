const { supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

// Helper to get or create Mongo user corresponding to Supabase user
const syncMongoUser = async (supabaseUser) => {
  let user = await User.findOne({ supabaseId: supabaseUser.id });
  if (!user) {
    user = await User.create({
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Traveler',
      avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });
  }
  return user;
};

// Mandatory Authentication Middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }

    const mongoUser = await syncMongoUser(supabaseUser);
    req.user = mongoUser;
    req.supabaseUser = supabaseUser;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// Optional Authentication Middleware (e.g. for feed personalization)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: supabaseUser } } = await supabaseAdmin.auth.getUser(token);
      if (supabaseUser) {
        req.user = await syncMongoUser(supabaseUser);
        req.supabaseUser = supabaseUser;
      }
    }
  } catch (err) {
    // Non-fatal for optional auth
  }
  next();
};

// Guard: Must be listing owner
const isListingOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.owner && listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this listing.' });
    }

    req.listing = listing;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Guard: Must be review author
const isReviewAuthor = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this review.' });
    }

    req.review = review;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
  isListingOwner,
  isReviewAuthor,
};
