const express = require('express');
const { body } = require('express-validator');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Admin analytics
router.get('/admin/analytics', dashboardController.getAdminAnalytics);

// User analytics  
router.get('/user-analytics', dashboardController.getUserAnalytics);

// Validation rules
const markAlertsValidation = [
  body('alertIds')
    .isArray({ min: 1 })
    .withMessage('Alert IDs must be a non-empty array'),
  body('alertIds.*')
    .isMongoId()
    .withMessage('Each alert ID must be a valid MongoDB ID')
];

// Existing routes
router.get('/overview', dashboardController.getDashboardOverview);
router.get('/analytics', dashboardController.getAnalytics);
router.get('/alerts', dashboardController.getAlerts);
router.put('/alerts/:policyId/read', markAlertsValidation, dashboardController.markAlertsRead);

module.exports = router;
