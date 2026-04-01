const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');
const Policy = require('../models/Policy');
const aiService = require('../services/aiService');

// Upload and analyze policy
const uploadPolicy = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {
      title,
      description,
      policyNumber,
      insuranceCompany,
      policyType,
      coverageAmount,
      premium,
      startDate,
      endDate,
      department,
      company
    } = req.body;

    // Extract text from uploaded file
    const filePath = req.file.path;
    const fileType = req.file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';
    
    console.log('Extracting text from file...');
    const extractedText = await aiService.extractTextFromFile(filePath, fileType);

    // Analyze policy with AI
    console.log('Analyzing policy with AI...');
    const aiAnalysis = await aiService.analyzePolicy(extractedText, policyType);

    // Generate embeddings for RAG
    console.log('Generating embeddings...');
    const textChunks = aiService.splitTextIntoChunks(extractedText);
    const embeddings = await aiService.generateEmbeddings(textChunks);

    // Create policy document
    const policy = new Policy({
      title,
      description,
      policyNumber,
      insuranceCompany,
      policyType,
      coverageAmount: coverageAmount ? parseFloat(coverageAmount) : undefined,
      premium: premium ? parseFloat(premium) : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      department,
      company,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      filePath: filePath,
      fileSize: req.file.size,
      fileType: fileType,
      aiAnalysis: aiAnalysis,
      embeddings: embeddings
    });

    await policy.save();

    // Populate user info for response
    await policy.populate('uploadedBy', 'name email department company');

    res.status(201).json({
      success: true,
      message: 'Policy uploaded and analyzed successfully',
      data: {
        policy
      }
    });
  } catch (error) {
    console.error('Upload policy error:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload policy',
      error: error.message
    });
  }
};

// Get all policies for a user
const getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    
    // User-specific filtering (non-admin users see only their policies)
    if (req.user.role !== 'admin') {
      filter.uploadedBy = req.user._id;
    }
    
    if (req.query.policyType) {
      filter.policyType = req.query.policyType;
    }
    
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Sort options
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const policies = await Policy.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Policy.countDocuments(filter);

    res.json({
      success: true,
      data: {
        policies,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies',
      error: error.message
    });
  }
};

// Get single policy by ID
const getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('uploadedBy', 'name email department company');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user has access to this policy
    if (policy.uploadedBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        policy
      }
    });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get policy',
      error: error.message
    });
  }
};

// Update policy
const updatePolicy = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      policyNumber,
      insuranceCompany,
      policyType,
      coverageAmount,
      premium,
      startDate,
      endDate,
      department,
      company
    } = req.body;

    // Find policy
    const policy = await Policy.findById(req.params.id);
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

    // Update policy
    const updateData = {
      title,
      description,
      policyNumber,
      insuranceCompany,
      policyType,
      coverageAmount: coverageAmount ? parseFloat(coverageAmount) : undefined,
      premium: premium ? parseFloat(premium) : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      department,
      company
    };

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email department company');

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: {
        policy: updatedPolicy
      }
    });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update policy',
      error: error.message
    });
  }
};

// Delete policy
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
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

    // Delete file from storage
    try {
      await fs.unlink(policy.filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Delete policy from database
    await Policy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete policy',
      error: error.message
    });
  }
};

// Download policy file
const downloadPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
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

    // Check if file exists
    try {
      await fs.access(policy.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${policy.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send file
    res.sendFile(path.resolve(policy.filePath));
  } catch (error) {
    console.error('Download policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download policy',
      error: error.message
    });
  }
};

// Get policy statistics
const getPolicyStats = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? {} : { uploadedBy: req.user.id };

    const stats = await Promise.all([
      Policy.countDocuments({ ...userId, status: 'active' }),
      Policy.countDocuments({ ...userId, status: 'expired' }),
      Policy.countDocuments({ ...userId, endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() } }),
      Policy.countDocuments({ ...userId, 'aiAnalysis.riskScore': { $gt: 80 } }),
      Policy.countDocuments({ ...userId, 'aiAnalysis.complianceScore': { $lt: 70 } })
    ]);

    const [totalPolicies, expiredPolicies, expiringSoon, highRisk, lowCompliance] = stats;

    // Get policy types distribution
    const policyTypes = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      { $group: { _id: '$policyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent alerts
    const recentPolicies = await Policy.find({
      ...userId,
      'alerts.isRead': false
    })
      .select('title alerts')
      .sort({ 'alerts.createdAt': -1 })
      .limit(5);

    const alerts = [];
    recentPolicies.forEach(policy => {
      policy.alerts.forEach(alert => {
        if (!alert.isRead) {
          alerts.push({
            ...alert.toObject(),
            policyTitle: policy.title,
            policyId: policy._id
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalPolicies,
          expiredPolicies,
          expiringSoon,
          highRisk,
          lowCompliance
        },
        policyTypes,
        alerts: alerts.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get policy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get policy statistics',
      error: error.message
    });
  }
};

module.exports = {
  uploadPolicy,
  getPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
  downloadPolicy,
  getPolicyStats
};
