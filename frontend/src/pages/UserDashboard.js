import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  DollarSign,
  MessageSquare,
  Calendar,
  TrendingUp,
  Shield,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/utils';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.dashboard.getUserAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
        <p className="mt-1 text-sm text-gray-500">Upload some policies to see your analytics.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your policies and get AI-powered insights</p>
      </div>

      {/* Stats Cards - Modern Clean Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.totalPolicies || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Coverage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics?.totalCoverage || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>Across all policies</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.expiringSoon || 0}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-amber-600">
            <span>Within 30 days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Risk Alerts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.highRiskPolicies || 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <span>High risk detected</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Policies - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Recent Policies</h3>
                <Link 
                  to="/policies" 
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {analytics?.recentPolicies?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentPolicies.map((policy, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-gray-900">{policy.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(policy.createdAt)} • {policy.insuranceCompany}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(policy.premium || 0)}
                          </p>
                          <p className="text-xs text-gray-500">Premium</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          policy.aiAnalysis?.riskScore > 60 
                            ? 'bg-red-100 text-red-700' 
                            : policy.aiAnalysis?.riskScore > 40 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-green-100 text-green-700'
                        }`}>
                          Risk {Math.round(policy.aiAnalysis?.riskScore || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-full inline-block">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="mt-4 text-sm font-medium text-gray-900">No policies yet</h4>
                  <p className="mt-1 text-sm text-gray-500">Upload your first policy to get started</p>
                  <Link 
                    to="/policies/upload" 
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Policy
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Insights - Takes up 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/policies/upload" 
                className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">Upload Policy</h4>
                  <p className="text-xs text-gray-500">Add a new insurance policy</p>
                </div>
              </Link>
              <Link 
                to="/chat" 
                className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">AI Chat</h4>
                  <p className="text-xs text-gray-500">Ask questions about policies</p>
                </div>
              </Link>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">AI Insights</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Your policies have been analyzed. We found 2 potential coverage gaps and 1 expiring policy.
            </p>
            <Link 
              to="/policies" 
              className="inline-flex items-center text-sm font-medium text-white hover:text-blue-100"
            >
              Review Insights <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts Section - Full Width */}
      {analytics?.alerts && analytics.alerts.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics.alerts.slice(0, 3).map((alert, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'high' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(alert.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'high' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
