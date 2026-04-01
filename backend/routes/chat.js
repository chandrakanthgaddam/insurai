const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const messageValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

const titleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
];

// Routes
router.post('/start/:policyId', authenticate, chatController.startChat);
router.post('/message/:chatId', authenticate, messageValidation, chatController.sendMessage);
router.get('/', authenticate, chatController.getChatHistory);
router.get('/:chatId', authenticate, chatController.getChatSession);
router.put('/:chatId/title', authenticate, titleValidation, chatController.updateChatTitle);
router.delete('/:chatId', authenticate, chatController.deleteChatSession);

module.exports = router;
