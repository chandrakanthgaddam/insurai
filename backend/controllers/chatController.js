const Policy = require('../models/Policy');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');

// Start new chat session
const startChat = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user has access to this policy
    if (policy.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create new chat session
    const chatHistory = new ChatHistory({
      user: req.user.id,
      policy: policyId,
      sessionTitle: `Chat about ${policy.title}`,
      messages: []
    });

    await chatHistory.save();

    res.status(201).json({
      success: true,
      message: 'Chat session started',
      data: {
        chatSession: chatHistory
      }
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat',
      error: error.message
    });
  }
};

// Send message in chat
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get chat session
    const chatHistory = await ChatHistory.findById(chatId).populate('policy');
    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user owns this chat session
    if (chatHistory.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add user message
    const userMessage = {
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    chatHistory.messages.push(userMessage);

    // Get policy embeddings for RAG
    const policy = chatHistory.policy;
    if (!policy.embeddings || policy.embeddings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Policy embeddings not available. Please regenerate embeddings first.'
      });
    }

    // Search for relevant chunks
    const relevantChunks = await aiService.searchRelevantChunks(
      message,
      policy.embeddings,
      5
    );

    // Generate AI response using RAG
    const ragResponse = await aiService.generateRAGResponse(message, relevantChunks);

    // Add AI response
    const assistantMessage = {
      type: 'assistant',
      content: ragResponse.answer,
      timestamp: new Date(),
      sources: ragResponse.sources.map((source, index) => ({
        policyId: policy._id,
        chunkIndex: index,
        relevanceScore: source.similarity,
        snippet: source.content
      }))
    };

    chatHistory.messages.push(assistantMessage);
    await chatHistory.save();

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage,
        assistantMessage,
        sources: ragResponse.sources
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's chat sessions
    const chatSessions = await ChatHistory.find({
      user: req.user.id,
      isActive: true
    })
      .populate('policy', 'title policyNumber insuranceCompany')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatHistory.countDocuments({
      user: req.user.id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        chatSessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// Get specific chat session
const getChatSession = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chatHistory = await ChatHistory.findById(chatId)
      .populate('policy', 'title policyNumber insuranceCompany policyType');

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user owns this chat session
    if (chatHistory.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chatSession: chatHistory
      }
    });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session',
      error: error.message
    });
  }
};

// Delete chat session
const deleteChatSession = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chatHistory = await ChatHistory.findById(chatId);
    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user owns this chat session
    if (chatHistory.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete by marking as inactive
    chatHistory.isActive = false;
    await chatHistory.save();

    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: error.message
    });
  }
};

// Update chat session title
const updateChatTitle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const chatHistory = await ChatHistory.findById(chatId);
    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Check if user owns this chat session
    if (chatHistory.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    chatHistory.sessionTitle = title.trim();
    await chatHistory.save();

    res.status(200).json({
      success: true,
      message: 'Chat title updated successfully',
      data: {
        chatSession: chatHistory
      }
    });
  } catch (error) {
    console.error('Update chat title error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat title',
      error: error.message
    });
  }
};

module.exports = {
  startChat,
  sendMessage,
  getChatHistory,
  getChatSession,
  deleteChatSession,
  updateChatTitle
};
