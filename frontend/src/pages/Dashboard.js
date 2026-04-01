import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  TrendingUp, 
  Bell,
  Calendar,
  DollarSign,
  Shield,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency, formatDate, getExpiryStatus, getRiskLevel } from '../utils/utils';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.dashboard.getOverview();
      setData(response.data.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-danger-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, distributions, recent, topCompanies } = data;

  const statCards = [
    {
      name: 'Total Policies',
      value: metrics.totalPolicies,
      icon: FileText,
      color: 'primary',
      change: '+2 from last month',
      changeType: 'increase',
    },
    {
      name: 'Active Policies',
      value: metrics.activePolicies,
      icon: Shield,
      color: 'success',
      change: '+1 from last month',
      changeType: 'increase',
    },
    {
      name: 'Expiring Soon',
      value: metrics.expiringSoon,
      icon: Calendar,
      color: 'warning',
      change: 'Need attention',
      changeType: 'warning',
    },
    {
      name: 'High Risk',
      value: metrics.highRiskPolicies,
      icon: AlertTriangle,
      color: 'danger',
      change: 'Review required',
      changeType: 'danger',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your insurance policy management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'bg-primary-500',
            success: 'bg-success-500',
            warning: 'bg-warning-500',
            danger: 'bg-danger-500',
          };

          return (
            <div key={stat.name} className="card">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[stat.color]} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-500`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className={`text-${stat.changeType === 'increase' ? 'success' : stat.changeType === 'warning' ? 'warning' : 'danger'}-600`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Policies */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Policies</h3>
            <Link to="/policies" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recent.policies?.length > 0 ? (
                recent.policies.map((policy) => (
                  <div key={policy._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {policy.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {policy.policyNumber} • {policy.insuranceCompany}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge badge-${getRiskLevel(policy.aiAnalysis?.riskScore).color}`}>
                        {getRiskLevel(policy.aiAnalysis?.riskScore).text}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No policies found</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
            <Link to="/alerts" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recent.alerts?.length > 0 ? (
                recent.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-1 rounded-full bg-${getSeverityColor(alert.severity)}-100`}>
                      <Bell className={`h-4 w-4 text-${getSeverityColor(alert.severity)}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.policyTitle} • {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No alerts</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/policies/upload"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Upload className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-sm font-medium text-gray-900">Upload Policy</span>
            </Link>
            
            <Link
              to="/policies"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-sm font-medium text-gray-900">View Policies</span>
            </Link>
            
            <Link
              to="/chat"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Activity className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-sm font-medium text-gray-900">AI Chat</span>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-sm font-medium text-gray-900">Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const getSeverityColor = (severity) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'warning',
    critical: 'danger',
  };
  return colors[severity] || 'gray';
};

export default Dashboard;
