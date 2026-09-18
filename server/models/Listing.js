const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    default: 'listingimage',
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [imageSchema],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [-73.985130, 40.748817], // default NYC
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Trending',
        'Beachfront',
        'Luxury',
        'Cabins',
        'Mansions',
        'Islands',
        'Countryside',
        'Iconic Cities',
        'Amazing Pools',
        'Camping',
        'Desert',
        'Lakefront',
        'Ski-in/out',
        'Arctic',
        'Tropical',
        'Castles',
        'Treehouses',
      ],
      default: 'Trending',
    },
    propertyType: {
      type: String,
      enum: ['House', 'Apartment', 'Villa', 'Cabin', 'Treehouse', 'Cottage', 'Mansion', 'Resort'],
      default: 'Villa',
    },
    amenities: [
      {
        type: String,
      },
    ],
    maxGuests: {
      type: Number,
      default: 4,
    },
    bedrooms: {
      type: Number,
      default: 2,
    },
    beds: {
      type: Number,
      default: 2,
    },
    bathrooms: {
      type: Number,
      default: 2,
    },
    cleaningFee: {
      type: Number,
      default: 60,
    },
    serviceFee: {
      type: Number,
      default: 45,
    },
    isGuestFavorite: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

// Auto-delete associated reviews when listing is deleted
listingSchema.post('findOneAndDelete', async function (listing) {
  if (listing && listing.reviews && listing.reviews.length > 0) {
    const Review = mongoose.model('Review');
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model('Listing', listingSchema);
