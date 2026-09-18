const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { requireAuth, isListingOwner } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router
  .route('/')
  .get(listingController.getAllListings)
  .post(requireAuth, upload.array('images', 8), listingController.createListing);

router.get('/my-listings', requireAuth, listingController.getMyListings);

router
  .route('/:id')
  .get(listingController.getListingById)
  .put(requireAuth, isListingOwner, upload.array('images', 8), listingController.updateListing)
  .delete(requireAuth, isListingOwner, listingController.deleteListing);

module.exports = router;
