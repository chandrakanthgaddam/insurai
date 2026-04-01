const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  policyNumber: {
    type: String,
    trim: true,
    required: [true, 'Policy number is required']
  },
  insuranceCompany: {
    type: String,
    trim: true,
    required: [true, 'Insurance company is required']
  },
  policyType: {
    type: String,
    enum: ['health', 'life', 'property', 'liability', 'auto', 'business', 'other'],
    required: [true, 'Policy type is required']
  },
  coverageAmount: {
    type: Number,
    min: [0, 'Coverage amount must be positive']
  },
  premium: {
    type: Number,
    min: [0, 'Premium must be positive']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  department: {
    type: String,
    trim: true,
    required: [true, 'Department is required']
  },
  company: {
    type: String,
    trim: true,
    required: [true, 'Company is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true
  },
  
  // AI Analysis Results
  aiAnalysis: {
    summary: {
      type: String,
      default: ''
    },
    coverage: [{
      type: String,
      trim: true
    }],
    risks: [{
      type: String,
      trim: true
    }],
    clauses: [{
      title: String,
      content: String,
      importance: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    }],
    exclusions: [{
      type: String,
      trim: true
    }],
    conditions: [{
      type: String,
      trim: true
    }],
    extractedEntities: {
      persons: [String],
      organizations: [String],
      dates: [String],
      amounts: [String]
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Vector embeddings for RAG
  embeddings: [{
    content: String,
    embedding: [Number],
    metadata: {
      pageNumber: Number,
      chunkIndex: Number,
      type: String
    }
  }],
  
  // Status and alerts
  status: {
    type: String,
    enum: ['active', 'expired', 'pending', 'cancelled'],
    default: 'active'
  },
  alerts: [{
    type: {
      type: String,
      enum: ['expiry', 'compliance', 'payment', 'risk'],
      required: true
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comparison data
  comparisonHistory: [{
    comparedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    },
    comparisonDate: {
      type: Date,
      default: Date.now
    },
    differences: {
      coverage: [String],
      premium: String,
      risks: [String]
    }
  }]
}, {
  timestamps: true
});

// Index for search functionality
policySchema.index({ title: 'text', description: 'text', 'aiAnalysis.summary': 'text' });
policySchema.index({ policyNumber: 1 });
policySchema.index({ insuranceCompany: 1 });
policySchema.index({ department: 1 });
policySchema.index({ company: 1 });
policySchema.index({ uploadedBy: 1 });
policySchema.index({ endDate: 1 }); // For expiry alerts
policySchema.index({ 'aiAnalysis.riskScore': 1 });
policySchema.index({ 'aiAnalysis.complianceScore': 1 });

// Virtual for days until expiry
policySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.endDate) return null;
  const today = new Date();
  const expiryDate = new Date(this.endDate);
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Check if policy is expiring soon (within 30 days)
policySchema.virtual('isExpiringSoon').get(function() {
  const days = this.daysUntilExpiry;
  return days !== null && days <= 30 && days >= 0;
});

// Middleware to check expiry status
policySchema.pre('save', function(next) {
  if (this.endDate && new Date(this.endDate) < new Date()) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Policy', policySchema);
