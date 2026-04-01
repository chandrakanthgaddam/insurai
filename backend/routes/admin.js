const express = require('express');
const { body, query } = require('express-validator');
const User = require('../models/User');
const Policy = require('../models/Policy');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticate);
router.use(authorizeAdmin);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get users with pagination
    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users,
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
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', [
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user')
], async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Don't allow admin to change their own role
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// Deactivate user (admin only)
router.put('/users/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow admin to deactivate themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
});

// Get all policies (admin only)
router.get('/policies', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = '', riskLevel = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { policyNumber: { $regex: search, $options: 'i' } },
        { insuranceCompany: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      searchQuery.policyType = type;
    }

    if (riskLevel) {
      const riskScore = parseInt(riskLevel);
      searchQuery['aiAnalysis.riskScore'] = {
        $gte: riskScore,
        $lt: riskScore + 20
      };
    }

    // Get policies with pagination
    const policies = await Policy.find(searchQuery)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Policy.countDocuments(searchQuery);

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
});

// Delete policy (admin only)
router.delete('/policies/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await Policy.findByIdAndDelete(policyId);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

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
});

// Get admin analytics
router.get('/analytics', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin', isActive: true });
    const regularUsers = totalUsers - adminUsers;

    // Policy statistics
    const totalPolicies = await Policy.countDocuments();
    const policiesByType = await Policy.aggregate([
      { $group: { _id: '$policyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Risk analysis
    const riskDistribution = await Policy.aggregate([
      { $match: { 'aiAnalysis.riskScore': { $exists: true } } },
      {
        $bucket: {
          groupBy: '$aiAnalysis.riskScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'unknown',
          output: {
            count: { $sum: 1 },
            range: { $push: '$aiAnalysis.riskScore' }
          }
        }
      }
    ]);

    // Recent activity
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentPolicies = await Policy.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: adminUsers,
          regular: regularUsers,
          recent: recentUsers
        },
        policies: {
          total: totalPolicies,
          byType: policiesByType,
          riskDistribution,
          recent: recentPolicies
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

module.exports = router;
