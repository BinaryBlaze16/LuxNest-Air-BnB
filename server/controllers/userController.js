const User = require('../models/User');
const Listing = require('../models/Listing');
const { processUpload } = require('../config/cloudinary');

// Get current user profile with populated wishlist
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, avatar } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (bio) updateFields.bio = bio;
    if (phone) updateFields.phone = phone;

    if (req.file) {
      const uploaded = await processUpload(req.file, 'luxnest_avatars');
      if (uploaded?.url) {
        updateFields.avatar = uploaded.url;
      }
    } else if (avatar) {
      updateFields.avatar = avatar;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('wishlist');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({
      success: true,
      data: user.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle wishlist item (Add / Remove)
exports.toggleWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    const user = await User.findById(req.user._id);

    const existsIndex = user.wishlist.findIndex((id) => id.toString() === listingId);

    let isAdded = false;
    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
      isAdded = false;
    } else {
      user.wishlist.push(listingId);
      isAdded = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isAdded,
      message: isAdded ? 'Saved to wishlist!' : 'Removed from wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
