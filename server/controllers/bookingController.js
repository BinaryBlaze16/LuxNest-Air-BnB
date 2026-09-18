const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// Create new reservation / booking
exports.createBooking = async (req, res) => {
  try {
    const {
      listingId,
      checkIn,
      checkOut,
      guests,
      paymentMethod = 'mock_card',
      specialRequests,
    } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
    }

    // Check for conflicting confirmed bookings
    const overlappingBookings = await Booking.find({
      listing: listingId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected dates are already booked. Please choose other dates.',
      });
    }

    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const baseTotal = nights * listing.price;
    const cleaningFee = listing.cleaningFee || 50;
    const serviceFee = listing.serviceFee || Math.round(baseTotal * 0.12);
    const taxes = Math.round((baseTotal + cleaningFee + serviceFee) * 0.08);
    const totalPrice = baseTotal + cleaningFee + serviceFee + taxes;

    const booking = new Booking({
      user: req.user._id,
      listing: listingId,
      checkIn: start,
      checkOut: end,
      nights,
      guests: guests || { adults: 1, children: 0, infants: 0, pets: 0 },
      pricePerNight: listing.price,
      baseTotal,
      cleaningFee,
      serviceFee,
      taxes,
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      specialRequests,
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('listing', 'title images location country price')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user's bookings (Trips)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ checkIn: -1 })
      .populate('listing', 'title images location country price owner geometry');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reserved date ranges for a listing (used by calendar to disable booked dates)
exports.getListingBookings = async (req, res) => {
  try {
    const { listingId } = req.params;
    const bookings = await Booking.find({
      listing: listingId,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gte: new Date() },
    }).select('checkIn checkOut');

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reservations on properties owned by current user (Host bookings)
exports.getHostReservations = async (req, res) => {
  try {
    const myListings = await Listing.find({ owner: req.user._id }).select('_id');
    const listingIds = myListings.map((l) => l._id);

    const reservations = await Booking.find({ listing: { $in: listingIds } })
      .sort({ createdAt: -1 })
      .populate('listing', 'title images location country price')
      .populate('user', 'name email avatar');

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled and refund processed.',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
