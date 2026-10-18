const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Price must be non-negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be non-negative']
  },
  discount: {
    type: String,
    default: '50% OFF'
  },
  stock: {
    type: Number,
    required: true,
    default: 50,
    min: [0, 'Stock cannot be negative']
  },
  soundLevel: {
    type: String,
    default: 'Medium Sound'
  },
  packSize: {
    type: String,
    default: '1 Standard Pack'
  },
  ecoFriendly: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestseller: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  rating: {
    type: Number,
    default: 4.9,
    min: 1,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 120
  },
  description: {
    type: String,
    trim: true
  },
  safetyInstructions: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
