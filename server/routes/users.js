const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/me', requireAuth, userController.getMe);
router.put('/profile', requireAuth, upload.single('avatar'), userController.updateProfile);
router.get('/wishlist', requireAuth, userController.getWishlist);
router.post('/wishlist/:listingId', requireAuth, userController.toggleWishlist);

module.exports = router;
