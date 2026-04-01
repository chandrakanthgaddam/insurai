import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Calendar,
  Download
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency, generateColor, calculatePercentage } from '../utils/utils';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');
  const [metric, setMetric] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, metric]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.dashboard.getAnalytics({ timeframe, metric });
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
        <p className="mt-1 text-sm text-gray-500">Upload some policies to see analytics.</p>
      </div>
    );
  }

  const { analytics, overview } = data;

  // Prepare chart data
  const policyTypeData = overview?.distributions?.policyTypes?.map((item, index) => ({
    name: item._id,
    value: item.count,
    premium: item.totalPremium,
    color: generateColor(index)
  })) || [];

  const premiumTrendData = analytics?.premiumAnalysis?.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    premium: item.totalPremium,
    avgPremium: item.avgPremium,
    count: item.count
  })) || [];

  const riskDistributionData = overview?.distributions?.riskLevels?.map((item, index) => ({
    name: `${item._id * 20}-${(item._id + 1) * 20}`,
    value: item.count,
    color: generateColor(index)
  })).filter(item => item.value > 0) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-gray-600">Insights and analytics for your insurance policies</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="btn btn-secondary"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-primary-500 bg-opacity-10">
                <FileText className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Total Policies</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.metrics?.totalPolicies || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-success-500 bg-opacity-10">
                <DollarSign className="h-6 w-6 text-success-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Total Premium</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(policyTypeData.reduce((sum, item) => sum + (item.premium || 0), 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-warning-500 bg-opacity-10">
                <AlertTriangle className="h-6 w-6 text-warning-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">High Risk Policies</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.metrics?.highRiskPolicies || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-danger-500 bg-opacity-10">
                <TrendingUp className="h-6 w-6 text-danger-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Avg Risk Score</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(overview?.metrics?.avgRiskScore || 0)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Policy Type Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Policy Type Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={policyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {policyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {policyTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900">{item.value} policies</div>
                    <div className="text-gray-500">{formatCurrency(item.premium || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Risk Score Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Premium Trends */}
      {premiumTrendData.length > 0 && (
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Premium Trends</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={premiumTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="premium"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Premium"
                />
                <Line
                  type="monotone"
                  dataKey="avgPremium"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Average Premium"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Companies */}
      {overview?.topCompanies && overview.topCompanies.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Top Insurance Companies</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {overview.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{company._id}</h4>
                      <p className="text-sm text-gray-500">{company.count} policies</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900">{formatCurrency(company.totalPremium)}</div>
                    <div className="text-sm text-gray-500">Avg Risk: {Math.round(company.avgRiskScore || 0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-8 flex justify-end">
        <button className="btn btn-secondary">
          <Download className="h-4 w-4 mr-2" />
          Export Analytics
        </button>
      </div>
    </div>
  );
};

export default Analytics;
