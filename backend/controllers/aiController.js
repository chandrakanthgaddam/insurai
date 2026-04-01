const Policy = require('../models/Policy');
const aiService = require('../services/aiService');

// Analyze existing policy with AI
const analyzePolicy = async (req, res) => {
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

    // Extract text from file
    const extractedText = await aiService.extractTextFromFile(policy.filePath, policy.fileType);

    // Analyze with AI
    const aiAnalysis = await aiService.analyzePolicy(extractedText, policy.policyType);

    // Update policy with new analysis
    policy.aiAnalysis = aiAnalysis;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy analyzed successfully',
      data: {
        policy
      }
    });
  } catch (error) {
    console.error('Analyze policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze policy',
      error: error.message
    });
  }
};

// Compare two policies
const comparePolicies = async (req, res) => {
  try {
    const { policyId1, policyId2 } = req.body;

    if (!policyId1 || !policyId2) {
      return res.status(400).json({
        success: false,
        message: 'Both policy IDs are required'
      });
    }

    // Get policies
    const [policy1, policy2] = await Promise.all([
      Policy.findById(policyId1),
      Policy.findById(policyId2)
    ]);

    if (!policy1 || !policy2) {
      return res.status(404).json({
        success: false,
        message: 'One or both policies not found'
      });
    }

    // Check access
    const userCanAccess1 = policy1.uploadedBy.toString() === req.user.id || req.user.role === 'admin';
    const userCanAccess2 = policy2.uploadedBy.toString() === req.user.id || req.user.role === 'admin';

    if (!userCanAccess1 || !userCanAccess2) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to one or both policies'
      });
    }

    // Compare policies using AI
    const comparison = await aiService.comparePolicies(policy1, policy2);

    // Save comparison history
    await Policy.findByIdAndUpdate(policyId1, {
      $push: {
        comparisonHistory: {
          comparedWith: policyId2,
          differences: {
            coverage: comparison.coverageComparison.policy1Only,
            premium: comparison.premiumComparison,
            risks: comparison.riskComparison
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Policies compared successfully',
      data: {
        policy1: {
          id: policy1._id,
          title: policy1.title,
          policyType: policy1.policyType,
          premium: policy1.premium,
          coverage: policy1.aiAnalysis.coverage,
          riskScore: policy1.aiAnalysis.riskScore
        },
        policy2: {
          id: policy2._id,
          title: policy2.title,
          policyType: policy2.policyType,
          premium: policy2.premium,
          coverage: policy2.aiAnalysis.coverage,
          riskScore: policy2.aiAnalysis.riskScore
        },
        comparison
      }
    });
  } catch (error) {
    console.error('Compare policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare policies',
      error: error.message
    });
  }
};

// Get policy insights
const getPolicyInsights = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access
    if (policy.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate insights
    const insights = {
      riskAnalysis: {
        score: policy.aiAnalysis.riskScore,
        level: policy.aiAnalysis.riskScore > 80 ? 'high' : policy.aiAnalysis.riskScore > 60 ? 'medium' : 'low',
        factors: policy.aiAnalysis.risks.slice(0, 5)
      },
      complianceAnalysis: {
        score: policy.aiAnalysis.complianceScore,
        level: policy.aiAnalysis.complianceScore < 70 ? 'poor' : policy.aiAnalysis.complianceScore < 85 ? 'good' : 'excellent',
        issues: policy.aiAnalysis.exclusions.slice(0, 3)
      },
      coverageAnalysis: {
        totalCoverage: policy.aiAnalysis.coverage.length,
        keyCoverage: policy.aiAnalysis.coverage.slice(0, 10),
        missingCoverage: [] // Could be enhanced with AI to detect missing coverage
      },
      criticalClauses: policy.aiAnalysis.clauses
        .filter(clause => clause.importance === 'critical')
        .slice(0, 5),
      recommendations: generateRecommendations(policy)
    };

    res.status(200).json({
      success: true,
      data: {
        policy: {
          id: policy._id,
          title: policy.title,
          policyNumber: policy.policyNumber,
          insuranceCompany: policy.insuranceCompany,
          policyType: policy.policyType,
          premium: policy.premium,
          coverageAmount: policy.coverageAmount,
          startDate: policy.startDate,
          endDate: policy.endDate
        },
        insights
      }
    });
  } catch (error) {
    console.error('Get policy insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get policy insights',
      error: error.message
    });
  }
};

// Generate recommendations based on policy analysis
const generateRecommendations = (policy) => {
  const recommendations = [];
  const { riskScore, complianceScore, coverage, risks, exclusions } = policy.aiAnalysis;

  // Risk-based recommendations
  if (riskScore > 80) {
    recommendations.push({
      type: 'risk',
      priority: 'high',
      title: 'High Risk Detected',
      description: 'This policy has high risk factors. Consider additional coverage or risk mitigation strategies.',
      action: 'Review policy terms and consider supplemental insurance'
    });
  }

  // Compliance-based recommendations
  if (complianceScore < 70) {
    recommendations.push({
      type: 'compliance',
      priority: 'medium',
      title: 'Compliance Issues',
      description: 'Policy has compliance concerns that need attention.',
      action: 'Review exclusions and conditions carefully'
    });
  }

  // Coverage-based recommendations
  if (coverage.length < 5) {
    recommendations.push({
      type: 'coverage',
      priority: 'medium',
      title: 'Limited Coverage',
      description: 'This policy appears to have limited coverage items.',
      action: 'Consider if additional coverage types are needed'
    });
  }

  // Expiry-based recommendations
  const daysUntilExpiry = Math.ceil((policy.endDate - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) {
    recommendations.push({
      type: 'expiry',
      priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
      title: 'Policy Expiring Soon',
      description: `Policy expires in ${daysUntilExpiry} days.`,
      action: 'Start renewal process or find alternative coverage'
    });
  }

  return recommendations;
};

// Re-generate embeddings for a policy
const regenerateEmbeddings = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check access
    if (policy.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Extract text from file
    const extractedText = await aiService.extractTextFromFile(policy.filePath, policy.fileType);

    // Generate new embeddings
    const textChunks = aiService.splitTextIntoChunks(extractedText);
    const embeddings = await aiService.generateEmbeddings(textChunks);

    // Update policy embeddings
    policy.embeddings = embeddings;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Embeddings regenerated successfully',
      data: {
        embeddingCount: embeddings.length
      }
    });
  } catch (error) {
    console.error('Regenerate embeddings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate embeddings',
      error: error.message
    });
  }
};

module.exports = {
  analyzePolicy,
  comparePolicies,
  getPolicyInsights,
  regenerateEmbeddings
};
