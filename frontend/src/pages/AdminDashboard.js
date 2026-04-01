import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Shield
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency, formatDate, calculatePercentage } from '../utils/utils';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.dashboard.getAdminAnalytics();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
        <p className="mt-1 text-sm text-gray-500">Upload some policies to see analytics.</p>
      </div>
    );
  }

  const { users, policies } = analytics;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">System overview and management</p>
      </div>

      {/* Stats Cards - Professional Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-amber-50 rounded-xl">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Policies</p>
              <p className="text-2xl font-bold text-gray-900">{policies?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">{policies?.highRisk || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Policies by Type</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {policies?.byType?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">{item._id}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {policies?.riskDistribution?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      item.range === '0-20' ? 'bg-green-500' :
                      item.range === '20-40' ? 'bg-yellow-500' :
                      item.range === '40-60' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.range === '0-20' ? 'Low Risk' :
                       item.range === '20-40' ? 'Medium Risk' :
                       item.range === '40-60' ? 'High Risk' : 'Critical Risk'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {users?.recent?.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Policies</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {policies?.recent?.map((policy, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">{policy.title}</p>
                      <p className="text-xs text-gray-500">
                        by {policy.uploadedBy?.name} • {formatDate(policy.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      policy.aiAnalysis?.riskScore > 80 ? 'bg-red-100 text-red-700' :
                      policy.aiAnalysis?.riskScore > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      Risk: {Math.round(policy.aiAnalysis?.riskScore || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/users" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center">
            <div className="p-3 bg-blue-50 rounded-xl inline-block mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Manage Users</h4>
            <p className="text-xs text-gray-500 mt-1">View and manage all users</p>
          </a>
          <a href="/admin/policies" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center">
            <div className="p-3 bg-green-50 rounded-xl inline-block mb-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Manage Policies</h4>
            <p className="text-xs text-gray-500 mt-1">View and manage all policies</p>
          </a>
          <a href="/admin/analytics" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center">
            <div className="p-3 bg-purple-50 rounded-xl inline-block mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">View Analytics</h4>
            <p className="text-xs text-gray-500 mt-1">Detailed system analytics</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
