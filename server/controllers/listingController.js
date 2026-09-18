const Listing = require('../models/Listing');
const { processUpload } = require('../config/cloudinary');

// Get all listings with advanced filters, search, pagination, and sorting
exports.getAllListings = async (req, res) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB database is not connected. Please ensure MONGODB_URI is set in Render Environment Variables and 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.',
    });
  }
  try {
    const {
      category,
      search,
      location,
      minPrice,
      maxPrice,
      propertyType,
      amenities,
      bedrooms,
      bathrooms,
      guests,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 24,
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All' && category !== 'Trending') {
      query.category = category;
    }

    // Search query (title, description, location, country)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { location: regex },
        { country: regex },
        { description: regex },
      ];
    }

    // Location specific search
    if (location && location.trim()) {
      const locRegex = new RegExp(location.trim(), 'i');
      query.$or = [{ location: locRegex }, { country: locRegex }];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Property Type
    if (propertyType && propertyType !== 'All') {
      query.propertyType = propertyType;
    }

    // Bedrooms / Bathrooms / Guests
    if (bedrooms && Number(bedrooms) > 0) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }
    if (bathrooms && Number(bathrooms) > 0) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }
    if (guests && Number(guests) > 0) {
      query.maxGuests = { $gte: Number(guests) };
    }

    // Amenities (all checked amenities must be included)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Sorting
    let sortOption = {};
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    else if (sortBy === 'price_desc') sortOption = { price: -1 };
    else if (sortBy === 'rating') sortOption = { rating: -1 };
    else sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name avatar isSuperhost email');

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single listing with reviews and host info
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate('owner', 'name avatar bio isSuperhost email createdAt')
      .populate({
        path: 'reviews',
        populate: {
          path: 'author',
          select: 'name avatar createdAt',
        },
        options: { sort: { createdAt: -1 } },
      });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new listing
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      country,
      category,
      propertyType,
      amenities,
      maxGuests,
      bedrooms,
      beds,
      bathrooms,
      cleaningFee,
      serviceFee,
      latitude,
      longitude,
      imageUrl,
    } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await processUpload(file, 'luxnest_listings');
        if (uploaded?.url) {
          images.push({ url: uploaded.url, filename: uploaded.filename });
        }
      }
    } else if (req.file) {
      const uploaded = await processUpload(req.file, 'luxnest_listings');
      if (uploaded?.url) {
        images.push({ url: uploaded.url, filename: uploaded.filename });
      }
    } else if (imageUrl) {
      images = [{ url: imageUrl, filename: 'custom_upload' }];
    } else {
      images = [
        {
          url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          filename: 'default_listing',
        },
      ];
    }

    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []);
    
    // Parse coordinates if provided
    let coordinates = [-73.98513, 40.748817];
    if (longitude && latitude) {
      coordinates = [Number(longitude), Number(latitude)];
    }

    const newListing = new Listing({
      title,
      description,
      price: Number(price),
      location,
      country,
      category: category || 'Trending',
      propertyType: propertyType || 'Villa',
      amenities: parsedAmenities,
      maxGuests: Number(maxGuests) || 4,
      bedrooms: Number(bedrooms) || 2,
      beds: Number(beds) || 2,
      bathrooms: Number(bathrooms) || 2,
      cleaningFee: Number(cleaningFee) || 50,
      serviceFee: Number(serviceFee) || 35,
      images,
      geometry: {
        type: 'Point',
        coordinates,
      },
      owner: req.user._id,
      rating: 5.0,
      reviewCount: 0,
      isGuestFavorite: false,
    });

    const savedListing = await newListing.save();
    const populatedListing = await Listing.findById(savedListing._id).populate('owner', 'name avatar bio isSuperhost email');

    res.status(201).json({
      success: true,
      message: 'Listing published successfully!',
      data: populatedListing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update existing listing
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.amenities && typeof updateData.amenities === 'string') {
      try {
        updateData.amenities = JSON.parse(updateData.amenities);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const uploaded = await processUpload(file, 'luxnest_listings');
        if (uploaded?.url) {
          newImages.push({ url: uploaded.url, filename: uploaded.filename });
        }
      }
      updateData.images = newImages;
    } else if (req.file) {
      const uploaded = await processUpload(req.file, 'luxnest_listings');
      if (uploaded?.url) {
        updateData.images = [{ url: uploaded.url, filename: uploaded.filename }];
      }
    }

    if (updateData.latitude && updateData.longitude) {
      updateData.geometry = {
        type: 'Point',
        coordinates: [Number(updateData.longitude), Number(updateData.latitude)],
      };
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({
      success: true,
      message: 'Listing updated successfully!',
      data: updatedListing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Listing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get listings by current logged-in host
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
