// routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const USER_ROLES = require('../constants/userRoles');

// Validation rules for creating a category
const createCategoryValidation = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('Category name is required')
    .isString()
    .withMessage('Category name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('type')
    .exists({ checkFalsy: true })
    .withMessage('Type is required')
    .isString()
    .withMessage('Type must be a string')
    .isIn(['product', 'blog'])
    .withMessage('Type must be either product or blog'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid category ID'),
];

// Validation rules for updating a category
const updateCategoryValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Category name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('type')
    .optional()
    .isString()
    .withMessage('Type must be a string')
    .isIn(['product', 'blog'])
    .withMessage('Type must be either product or blog'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid category ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

// Routes

/**
 * @route   GET /api/categories
 * @desc    Get all categories, optionally filtered by type
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get a single category by its ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    validateMiddleware,
  ],
  categoryController.getCategoryById
);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private/Admin
 */
router.post(
  '/',
  authMiddleware,
  adminMiddleware([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  createCategoryValidation,
  validateMiddleware,
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update an existing category
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    ...updateCategoryValidation,
  ],
  validateMiddleware,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    validateMiddleware,
  ],
  categoryController.deleteCategory
);

module.exports = router;