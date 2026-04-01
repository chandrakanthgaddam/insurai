const express = require('express');
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const compareValidation = [
  body('policyId1')
    .notEmpty()
    .withMessage('First policy ID is required')
    .isMongoId()
    .withMessage('Invalid policy ID format'),
  
  body('policyId2')
    .notEmpty()
    .withMessage('Second policy ID is required')
    .isMongoId()
    .withMessage('Invalid policy ID format')
    .custom((value, { req }) => {
      if (value === req.body.policyId1) {
        throw new Error('Policy IDs must be different');
      }
      return true;
    })
];

// Routes
router.post('/analyze/:policyId', authenticate, aiController.analyzePolicy);
router.post('/compare', authenticate, compareValidation, aiController.comparePolicies);
router.get('/insights/:policyId', authenticate, aiController.getPolicyInsights);
router.post('/embeddings/:policyId', authenticate, aiController.regenerateEmbeddings);

module.exports = router;
