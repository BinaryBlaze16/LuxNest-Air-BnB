const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { requireAuth, isReviewAuthor } = require('../middleware/auth');

router.post('/', requireAuth, reviewController.createReview);
router.delete('/:reviewId', requireAuth, isReviewAuthor, reviewController.deleteReview);

module.exports = router;
