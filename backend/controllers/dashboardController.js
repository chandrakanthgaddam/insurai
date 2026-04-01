const Policy = require('../models/Policy');
const User = require('../models/User');
const alertService = require('../services/alertService');

// Get admin analytics
const getAdminAnalytics = async (req, res) => {
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

    const highRiskPolicies = await Policy.countDocuments({
      'aiAnalysis.riskScore': { $gt: 80 }
    });

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
          highRisk: highRiskPolicies,
          recent: recentPolicies
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin analytics',
      error: error.message
    });
  }
};

// Get user-specific analytics
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // User's policy statistics
    const [
      totalPolicies,
      activePolicies,
      expiredPolicies,
      expiringSoon,
      highRiskPolicies,
      lowCompliancePolicies
    ] = await Promise.all([
      Policy.countDocuments({ uploadedBy: userId }),
      Policy.countDocuments({ uploadedBy: userId, status: 'active' }),
      Policy.countDocuments({ uploadedBy: userId, status: 'expired' }),
      Policy.countDocuments({
        uploadedBy: userId,
        endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
        status: 'active'
      }),
      Policy.countDocuments({
        uploadedBy: userId,
        'aiAnalysis.riskScore': { $gt: 80 },
        status: 'active'
      }),
      Policy.countDocuments({
        uploadedBy: userId,
        'aiAnalysis.complianceScore': { $lt: 70 },
        status: 'active'
      })
    ]);

    // Get user's policy type distribution
    const policyTypeDistribution = await Policy.aggregate([
      { $match: { uploadedBy: userId, status: 'active' } },
      { $group: { _id: '$policyType', count: { $sum: 1 }, totalPremium: { $sum: '$premium' } } },
      { $sort: { count: -1 } }
    ]);

    // Get total coverage
    const coverageResult = await Policy.aggregate([
      { $match: { uploadedBy: userId, status: 'active' } },
      { $group: { _id: null, totalCoverage: { $sum: '$coverageAmount' } } }
    ]);

    const totalCoverage = coverageResult[0]?.totalCoverage || 0;

    // Get recent policies
    const recentPolicies = await Policy.find({ uploadedBy: userId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's alerts
    const alerts = await alertService.getUserAlerts(userId);

    res.json({
      success: true,
      data: {
        totalPolicies,
        activePolicies,
        expiredPolicies,
        expiringSoon,
        highRiskPolicies,
        lowCompliancePolicies,
        totalCoverage,
        policyTypes: policyTypeDistribution,
        recentPolicies,
        alerts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
};

// Get dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? {} : { uploadedBy: req.user.id };

    // Get policy statistics
    const [
      totalPolicies,
      activePolicies,
      expiredPolicies,
      expiringSoon,
      highRiskPolicies,
      lowCompliancePolicies
    ] = await Promise.all([
      Policy.countDocuments(userId),
      Policy.countDocuments({ ...userId, status: 'active' }),
      Policy.countDocuments({ ...userId, status: 'expired' }),
      Policy.countDocuments({
        ...userId,
        endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
        status: 'active'
      }),
      Policy.countDocuments({
        ...userId,
        'aiAnalysis.riskScore': { $gt: 80 },
        status: 'active'
      }),
      Policy.countDocuments({
        ...userId,
        'aiAnalysis.complianceScore': { $lt: 70 },
        status: 'active'
      })
    ]);

    // Get policy type distribution
    const policyTypeDistribution = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      { $group: { _id: '$policyType', count: { $sum: 1 }, totalPremium: { $sum: '$premium' } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly premium trends
    const premiumTrends = await Policy.aggregate([
      {
        $match: {
          ...userId,
          status: 'active',
          startDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          totalPremium: { $sum: '$premium' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get risk and compliance score distributions
    const riskDistribution = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      {
        $bucket: {
          groupBy: '$aiAnalysis.riskScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            policies: { $push: { title: '$title', score: '$aiAnalysis.riskScore' } }
          }
        }
      }
    ]);

    const complianceDistribution = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      {
        $bucket: {
          groupBy: '$aiAnalysis.complianceScore',
          boundaries: [0, 50, 70, 85, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            policies: { $push: { title: '$title', score: '$aiAnalysis.complianceScore' } }
          }
        }
      }
    ]);

    // Get recent alerts
    const alerts = await alertService.getUnreadAlerts(req.user.id);

    // Get recent policies
    const recentPolicies = await Policy.find(userId)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title policyNumber insuranceCompany policyType createdAt endDate aiAnalysis.riskScore aiAnalysis.complianceScore');

    // Get top insurance companies
    const topCompanies = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      {
        $group: {
          _id: '$insuranceCompany',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium' },
          avgRiskScore: { $avg: '$aiAnalysis.riskScore' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Calculate overall health metrics
    const avgRiskScore = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      { $group: { _id: null, avgScore: { $avg: '$aiAnalysis.riskScore' } } }
    ]);

    const avgComplianceScore = await Policy.aggregate([
      { $match: { ...userId, status: 'active' } },
      { $group: { _id: null, avgScore: { $avg: '$aiAnalysis.complianceScore' } } }
    ]);

    const overview = {
      metrics: {
        totalPolicies,
        activePolicies,
        expiredPolicies,
        expiringSoon,
        highRiskPolicies,
        lowCompliancePolicies,
        avgRiskScore: avgRiskScore[0]?.avgScore || 0,
        avgComplianceScore: avgCompliance[0]?.avgScore || 0
      },
      distributions: {
        policyTypes: policyTypeDistribution,
        riskLevels: riskDistribution,
        complianceLevels: complianceDistribution
      },
      trends: {
        premiumTrends
      },
      recent: {
        policies: recentPolicies,
        alerts: alerts.slice(0, 5)
      },
      topCompanies
    };

    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error.message
    });
  }
};

// Get detailed analytics
const getAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month', metric = 'all' } = req.query;
    const userId = req.user.role === 'admin' ? {} : { uploadedBy: req.user.id };

    // Calculate date range based on timeframe
    let dateRange;
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        dateRange = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateRange = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'quarter':
        dateRange = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateRange = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateRange = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    const analytics = {};

    // Policy creation trends
    if (metric === 'all' || metric === 'policies') {
      analytics.policyTrends = await Policy.aggregate([
        { $match: { ...userId, createdAt: dateRange } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: timeframe === 'week' ? { $dayOfMonth: '$createdAt' } : null
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    }

    // Premium analysis
    if (metric === 'all' || metric === 'premium') {
      analytics.premiumAnalysis = await Policy.aggregate([
        { $match: { ...userId, premium: { $exists: true, $gt: 0 }, createdAt: dateRange } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalPremium: { $sum: '$premium' },
            avgPremium: { $avg: '$premium' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
    }

    // Risk score evolution
    if (metric === 'all' || metric === 'risk') {
      analytics.riskEvolution = await Policy.aggregate([
        { $match: { ...userId, 'aiAnalysis.riskScore': { $exists: true }, createdAt: dateRange } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            avgRiskScore: { $avg: '$aiAnalysis.riskScore' },
            maxRiskScore: { $max: '$aiAnalysis.riskScore' },
            minRiskScore: { $min: '$aiAnalysis.riskScore' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
    }

    // Department analysis (if admin)
    if (req.user.role === 'admin' && (metric === 'all' || metric === 'departments')) {
      analytics.departmentAnalysis = await Policy.aggregate([
        { $match: { createdAt: dateRange } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            totalPremium: { $sum: '$premium' },
            avgRiskScore: { $avg: '$aiAnalysis.riskScore' },
            avgComplianceScore: { $avg: '$aiAnalysis.complianceScore' }
          }
        },
        { $sort: { count: -1 } }
      ]);
    }

    // Company analysis
    if (metric === 'all' || metric === 'companies') {
      analytics.companyAnalysis = await Policy.aggregate([
        { $match: { ...userId, createdAt: dateRange } },
        {
          $group: {
            _id: '$company',
            count: { $sum: 1 },
            totalPremium: { $sum: '$premium' },
            avgRiskScore: { $avg: '$aiAnalysis.riskScore' },
            policyTypes: { $addToSet: '$policyType' }
          }
        },
        { $sort: { count: -1 } }
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        analytics,
        timeframe,
        metric
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

// Get alerts
const getAlerts = async (req, res) => {
  try {
    const { type, severity, isRead } = req.query;
    const userId = req.user.role === 'admin' ? {} : { uploadedBy: req.user.id };

    // Build filter
    const filter = { ...userId };
    
    if (type) {
      filter['alerts.type'] = type;
    }
    
    if (severity) {
      filter['alerts.severity'] = severity;
    }
    
    if (isRead !== undefined) {
      filter['alerts.isRead'] = isRead === 'true';
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get policies with matching alerts
    const policies = await Policy.find(filter)
      .select('title alerts')
      .sort({ 'alerts.createdAt': -1 })
      .skip(skip)
      .limit(limit);

    // Extract and flatten alerts
    const alerts = [];
    policies.forEach(policy => {
      policy.alerts.forEach(alert => {
        if ((!type || alert.type === type) &&
            (!severity || alert.severity === severity) &&
            (isRead === undefined || alert.isRead === (isRead === 'true'))) {
          alerts.push({
            ...alert.toObject(),
            policyTitle: policy.title,
            policyId: policy._id
          });
        }
      });
    });

    // Sort alerts by creation date
    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get total count
    const totalAlerts = await Policy.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        alerts: alerts.slice(0, limit),
        pagination: {
          page,
          limit,
          total: totalAlerts,
          pages: Math.ceil(totalAlerts / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: error.message
    });
  }
};

// Mark alerts as read
const markAlertsRead = async (req, res) => {
  try {
    const { alertIds } = req.body;
    const { policyId } = req.params;

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Alert IDs are required'
      });
    }

    const success = await alertService.markAlertsAsRead(policyId, alertIds);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Alerts marked as read successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to mark alerts as read'
      });
    }
  } catch (error) {
    console.error('Mark alerts read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alerts as read',
      error: error.message
    });
  }
};

module.exports = {
  getAdminAnalytics,
  getUserAnalytics,
  getDashboardOverview,
  getAnalytics,
  getAlerts,
  markAlertsRead
};
