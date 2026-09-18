const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, bookingController.createBooking);
router.get('/my-bookings', requireAuth, bookingController.getMyBookings);
router.get('/host-reservations', requireAuth, bookingController.getHostReservations);
router.get('/listing/:listingId', bookingController.getListingBookings);
router.patch('/:id/cancel', requireAuth, bookingController.cancelBooking);

module.exports = router;
