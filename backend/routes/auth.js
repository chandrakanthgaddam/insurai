const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company cannot exceed 100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company cannot exceed 100 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, authController.changePassword);

// Admin routes
router.get('/users', authenticate, authorizeAdmin, authController.getAllUsers);
router.put('/deactivate/:userId', authenticate, authorizeAdmin, authController.deactivateUser);

module.exports = router;
