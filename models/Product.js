const mongoose = require('mongoose');
const slugify = require('slugify');

// Variant Schema
const VariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, 'Variant size is required'],
      trim: true,
      maxlength: [20, 'Size cannot exceed 20 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

// Accordion Schema
const AccordionSchema = new mongoose.Schema(
  {
    details: {
      type: String,
      required: [true, 'Details section is required'],
      trim: true,
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
    },
    shipping: {
      type: String,
      required: [true, 'Shipping information is required'],
      trim: true,
      maxlength: [1000, 'Shipping information cannot exceed 1000 characters'],
    },
    returns: {
      type: String,
      required: [true, 'Returns policy is required'],
      trim: true,
      maxlength: [1000, 'Returns policy cannot exceed 1000 characters'],
    },
  },
  { _id: false }
);

// Custom Validators
function arrayLimit(val) {
  return val.length > 0;
}

// Product Schema
const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Slug cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Beverages', 'Snacks', 'Health', 'Other'], // Modify categories based on actual needs
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
      trim: true,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i, 'Please enter a valid image URL'],
    },
    images: [
      {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i, 'Please enter valid image URLs'],
        validate: [arrayLimit, '{PATH} must have at least one image'],
      },
    ],
    productBG: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i, 'Please enter a valid background image URL'],
    },
    variants: {
      type: [VariantSchema],
      required: true,
      validate: [arrayLimit, '{PATH} must have at least one variant'],
    },
    packaging: {
      type: [String],
      required: true,
      enum: ['Bottle', 'Box', 'Canister'], // Modify based on actual packaging types
    },
    accordion: {
      type: AccordionSchema,
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        validate: {
          validator: async function (v) {
            const Tag = mongoose.model('Tag');
            return await Tag.exists({ _id: v });
          },
          message: 'One or more tags are invalid.',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for discounted price per variant
ProductSchema.virtual('discountedPrices').get(function () {
  return this.variants.map(variant => ({
    size: variant.size,
    discountedPrice: variant.price - (variant.price * this.discountPercentage) / 100,
  }));
});

// Slug generation pre-save
ProductSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Indexes for optimized search
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', ProductSchema);