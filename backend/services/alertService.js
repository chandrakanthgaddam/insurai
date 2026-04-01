const cron = require('node-cron');
const Policy = require('../models/Policy');
const nodemailer = require('nodemailer');

class AlertService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailService();
  }

  /**
   * Initialize email service for alerts
   */
  initializeEmailService() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  /**
   * Start scheduled tasks for alerts
   */
  startScheduledTasks() {
    // Run every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.checkExpiringPolicies();
      await this.checkComplianceIssues();
      await this.checkHighRiskPolicies();
    });

    // Run every hour for urgent alerts
    cron.schedule('0 * * * *', async () => {
      await this.checkUrgentExpiry();
    });

    console.log('📅 Alert service scheduled tasks started');
  }

  /**
   * Check for policies expiring soon (within 30 days)
   */
  async checkExpiringPolicies() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringPolicies = await Policy.find({
        endDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
        status: 'active',
        'alerts.type': { $ne: 'expiry' }
      }).populate('uploadedBy', 'name email');

      for (const policy of expiringPolicies) {
        await this.createExpiryAlert(policy);
        
        if (this.emailTransporter && policy.uploadedBy.email) {
          await this.sendExpiryEmail(policy);
        }
      }

      console.log(`📅 Checked expiring policies: ${expiringPolicies.length} alerts created`);
    } catch (error) {
      console.error('Error checking expiring policies:', error);
    }
  }

  /**
   * Check for policies expiring within 24 hours
   */
  async checkUrgentExpiry() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const urgentPolicies = await Policy.find({
        endDate: { $lte: tomorrow, $gte: new Date() },
        status: 'active'
      }).populate('uploadedBy', 'name email');

      for (const policy of urgentPolicies) {
        // Create urgent alert
        await this.createUrgentExpiryAlert(policy);
        
        if (this.emailTransporter && policy.uploadedBy.email) {
          await this.sendUrgentExpiryEmail(policy);
        }
      }

      if (urgentPolicies.length > 0) {
        console.log(`🚨 URGENT: ${urgentPolicies.length} policies expiring within 24 hours`);
      }
    } catch (error) {
      console.error('Error checking urgent expiry:', error);
    }
  }

  /**
   * Check for compliance issues
   */
  async checkComplianceIssues() {
    try {
      const lowCompliancePolicies = await Policy.find({
        'aiAnalysis.complianceScore': { $lt: 70 },
        status: 'active',
        'alerts.type': { $ne: 'compliance' }
      }).populate('uploadedBy', 'name email');

      for (const policy of lowCompliancePolicies) {
        await this.createComplianceAlert(policy);
        
        if (this.emailTransporter && policy.uploadedBy.email) {
          await this.sendComplianceEmail(policy);
        }
      }

      console.log(`📋 Checked compliance: ${lowCompliancePolicies.length} alerts created`);
    } catch (error) {
      console.error('Error checking compliance:', error);
    }
  }

  /**
   * Check for high-risk policies
   */
  async checkHighRiskPolicies() {
    try {
      const highRiskPolicies = await Policy.find({
        'aiAnalysis.riskScore': { $gt: 80 },
        status: 'active',
        'alerts.type': { $ne: 'risk' }
      }).populate('uploadedBy', 'name email');

      for (const policy of highRiskPolicies) {
        await this.createRiskAlert(policy);
        
        if (this.emailTransporter && policy.uploadedBy.email) {
          await this.sendRiskEmail(policy);
        }
      }

      console.log(`⚠️ Checked high risk: ${highRiskPolicies.length} alerts created`);
    } catch (error) {
      console.error('Error checking high risk policies:', error);
    }
  }

  /**
   * Create expiry alert for a policy
   */
  async createExpiryAlert(policy) {
    const daysUntilExpiry = Math.ceil((policy.endDate - new Date()) / (1000 * 60 * 60 * 24));
    let severity = 'medium';
    
    if (daysUntilExpiry <= 7) severity = 'high';
    if (daysUntilExpiry <= 3) severity = 'critical';

    const alert = {
      type: 'expiry',
      message: `Policy "${policy.title}" expires in ${daysUntilExpiry} days (${policy.endDate.toDateString()})`,
      severity: severity,
      isRead: false,
      createdAt: new Date()
    };

    await Policy.findByIdAndUpdate(policy._id, {
      $push: { alerts: alert }
    });
  }

  /**
   * Create urgent expiry alert
   */
  async createUrgentExpiryAlert(policy) {
    const alert = {
      type: 'expiry',
      message: `🚨 URGENT: Policy "${policy.title}" expires TOMORROW!`,
      severity: 'critical',
      isRead: false,
      createdAt: new Date()
    };

    await Policy.findByIdAndUpdate(policy._id, {
      $push: { alerts: alert }
    });
  }

  /**
   * Create compliance alert
   */
  async createComplianceAlert(policy) {
    const alert = {
      type: 'compliance',
      message: `Policy "${policy.title}" has low compliance score: ${policy.aiAnalysis.complianceScore}/100`,
      severity: 'medium',
      isRead: false,
      createdAt: new Date()
    };

    await Policy.findByIdAndUpdate(policy._id, {
      $push: { alerts: alert }
    });
  }

  /**
   * Create risk alert
   */
  async createRiskAlert(policy) {
    const alert = {
      type: 'risk',
      message: `Policy "${policy.title}" has high risk score: ${policy.aiAnalysis.riskScore}/100`,
      severity: 'high',
      isRead: false,
      createdAt: new Date()
    };

    await Policy.findByIdAndUpdate(policy._id, {
      $push: { alerts: alert }
    });
  }

  /**
   * Send expiry email notification
   */
  async sendExpiryEmail(policy) {
    const daysUntilExpiry = Math.ceil((policy.endDate - new Date()) / (1000 * 60 * 60 * 24));
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: policy.uploadedBy.email,
      subject: `Policy Expiry Alert: ${policy.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">📅 Policy Expiry Alert</h2>
          <p>Hello ${policy.uploadedBy.name},</p>
          <p>Your insurance policy is expiring soon:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${policy.title}</h3>
            <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
            <p><strong>Insurance Company:</strong> ${policy.insuranceCompany}</p>
            <p><strong>Expiry Date:</strong> ${policy.endDate.toDateString()}</p>
            <p><strong>Days Until Expiry:</strong> <span style="color: #e74c3c; font-weight: bold;">${daysUntilExpiry}</span></p>
          </div>
          <p>Please take necessary action to renew or update your policy.</p>
          <p>Best regards,<br>InsurAI System</p>
        </div>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending expiry email:', error);
    }
  }

  /**
   * Send urgent expiry email
   */
  async sendUrgentExpiryEmail(policy) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: policy.uploadedBy.email,
      subject: `🚨 URGENT: Policy Expires Tomorrow - ${policy.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">🚨 URGENT: Policy Expiry Tomorrow!</h2>
          <p>Hello ${policy.uploadedBy.name},</p>
          <p><strong>Your insurance policy expires TOMORROW!</strong></p>
          <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #e74c3c;">
            <h3>${policy.title}</h3>
            <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
            <p><strong>Insurance Company:</strong> ${policy.insuranceCompany}</p>
            <p><strong>Expiry Date:</strong> ${policy.endDate.toDateString()}</p>
          </div>
          <p style="color: #e74c3c; font-weight: bold;">Please take immediate action to avoid coverage lapse!</p>
          <p>Best regards,<br>InsurAI System</p>
        </div>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending urgent expiry email:', error);
    }
  }

  /**
   * Send compliance email
   */
  async sendComplianceEmail(policy) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: policy.uploadedBy.email,
      subject: `Compliance Alert: ${policy.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f39c12;">📋 Compliance Alert</h2>
          <p>Hello ${policy.uploadedBy.name},</p>
          <p>Your policy has compliance issues that need attention:</p>
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${policy.title}</h3>
            <p><strong>Compliance Score:</strong> <span style="color: #f39c12;">${policy.aiAnalysis.complianceScore}/100</span></p>
            <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
            <p><strong>Insurance Company:</strong> ${policy.insuranceCompany}</p>
          </div>
          <p>Please review the policy and address compliance concerns.</p>
          <p>Best regards,<br>InsurAI System</p>
        </div>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending compliance email:', error);
    }
  }

  /**
   * Send risk email
   */
  async sendRiskEmail(policy) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: policy.uploadedBy.email,
      subject: `Risk Alert: ${policy.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e67e22;">⚠️ Risk Alert</h2>
          <p>Hello ${policy.uploadedBy.name},</p>
          <p>Your policy has been flagged with high risk factors:</p>
          <div style="background-color: #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${policy.title}</h3>
            <p><strong>Risk Score:</strong> <span style="color: #e67e22;">${policy.aiAnalysis.riskScore}/100</span></p>
            <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
            <p><strong>Insurance Company:</strong> ${policy.insuranceCompany}</p>
          </div>
          <p>Please review the policy and consider risk mitigation strategies.</p>
          <p>Best regards,<br>InsurAI System</p>
        </div>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending risk email:', error);
    }
  }

  /**
   * Get all unread alerts for a user
   */
  async getUnreadAlerts(userId) {
    try {
      const policies = await Policy.find({
        uploadedBy: userId,
        'alerts.isRead': false
      }).select('title alerts');

      const alerts = [];
      policies.forEach(policy => {
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

      return alerts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting unread alerts:', error);
      return [];
    }
  }

  /**
   * Mark alerts as read
   */
  async markAlertsAsRead(policyId, alertIds) {
    try {
      await Policy.updateMany(
        { _id: policyId, 'alerts._id': { $in: alertIds } },
        { $set: { 'alerts.$.isRead': true } }
      );
      
      return true;
    } catch (error) {
      console.error('Error marking alerts as read:', error);
      return false;
    }
  }
}

module.exports = new AlertService();
