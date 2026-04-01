const express = require('express');
const { body } = require('express-validator');
const policyController = require('../controllers/policyController');
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Policy title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('policyNumber')
    .trim()
    .notEmpty()
    .withMessage('Policy number is required'),
  
  body('insuranceCompany')
    .trim()
    .notEmpty()
    .withMessage('Insurance company is required')
    .isLength({ max: 100 })
    .withMessage('Insurance company cannot exceed 100 characters'),
  
  body('policyType')
    .isIn(['health', 'life', 'property', 'liability', 'auto', 'business', 'other'])
    .withMessage('Invalid policy type'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 100 })
    .withMessage('Company cannot exceed 100 characters'),
  
  body('coverageAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Coverage amount must be a positive number'),
  
  body('premium')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Premium must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const updateValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Policy title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('policyNumber')
    .trim()
    .notEmpty()
    .withMessage('Policy number is required'),
  
  body('insuranceCompany')
    .trim()
    .notEmpty()
    .withMessage('Insurance company is required')
    .isLength({ max: 100 })
    .withMessage('Insurance company cannot exceed 100 characters'),
  
  body('policyType')
    .isIn(['health', 'life', 'property', 'liability', 'auto', 'business', 'other'])
    .withMessage('Invalid policy type'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 100 })
    .withMessage('Company cannot exceed 100 characters'),
  
  body('coverageAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Coverage amount must be a positive number'),
  
  body('premium')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Premium must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Routes
router.post('/upload', 
  authenticate, 
  upload.single('policyFile'), 
  handleUploadError,
  uploadValidation, 
  policyController.uploadPolicy
);

router.get('/', authenticate, policyController.getAllPolicies);
router.get('/stats', authenticate, policyController.getPolicyStats);
router.get('/:id', authenticate, policyController.getPolicy);
router.get('/:id/download', authenticate, policyController.downloadPolicy);

router.put('/:id', authenticate, updateValidation, policyController.updatePolicy);
router.delete('/:id', authenticate, policyController.deletePolicy);

module.exports = router;
