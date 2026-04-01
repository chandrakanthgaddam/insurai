const Policy = require('../models/Policy');
const { validationResult } = require('express-validator');

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

    res.json({
      success: true,
      data: {
        totalPolicies,
        expiredPolicies,
        expiringSoon,
        highRisk,
        lowCompliance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get policy statistics',
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
    if (req.user.role !== 'admin' && policy.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { policy }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy',
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

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user has access to this policy
    if (req.user.role !== 'admin' && policy.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update policy fields
    const updateData = {
      title: title || policy.title,
      description: description || policy.description,
      policyNumber: policyNumber || policy.policyNumber,
      insuranceCompany: insuranceCompany || policy.insuranceCompany,
      policyType: policyType || policy.policyType,
      coverageAmount: coverageAmount ? parseFloat(coverageAmount) : policy.coverageAmount,
      premium: premium ? parseFloat(premium) : policy.premium,
      startDate: startDate ? new Date(startDate) : policy.startDate,
      endDate: endDate ? new Date(endDate) : policy.endDate,
      department: department || policy.department,
      company: company || policy.company
    };

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: { policy: updatedPolicy }
    });
  } catch (error) {
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
    if (req.user.role !== 'admin' && policy.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Policy.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
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
    if (req.user.role !== 'admin' && policy.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!policy.filePath) {
      return res.status(404).json({
        success: false,
        message: 'Policy file not found'
      });
    }

    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, '..', policy.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath, policy.fileName || 'policy.pdf');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download policy',
      error: error.message
    });
  }
};

module.exports = {
  uploadPolicy: getAllPolicies,
  getAllPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
  downloadPolicy,
  getPolicyStats
};
