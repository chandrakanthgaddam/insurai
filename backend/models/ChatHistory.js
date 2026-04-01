const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sources: [{
      policyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy'
      },
      chunkIndex: Number,
      pageNumber: Number,
      relevanceScore: Number,
      snippet: String
    }]
  }],
  sessionTitle: {
    type: String,
    default: 'New Chat Session'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatHistorySchema.index({ user: 1, policy: 1 });
chatHistorySchema.index({ user: 1, isActive: 1 });
chatHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
