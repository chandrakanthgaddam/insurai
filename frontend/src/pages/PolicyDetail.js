import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Edit, 
  ArrowLeft,
  Calendar,
  DollarSign,
  Building,
  Shield,
  AlertTriangle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatDate, formatCurrency, getExpiryStatus, getRiskLevel, getPolicyTypeDisplay } from '../utils/utils';
import toast from 'react-hot-toast';

const PolicyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await apiService.policies.getById(id);
      setPolicy(response.data.data.policy);
    } catch (error) {
      toast.error('Failed to load policy');
      console.error('Policy detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await apiService.policies.download(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = policy.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download policy');
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Policy not found</h3>
        <p className="mt-1 text-sm text-gray-500">The policy you're looking for doesn't exist.</p>
        <Link to="/policies" className="mt-4 btn btn-primary">
          Back to Policies
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'analysis', name: 'AI Analysis', icon: TrendingUp },
    { id: 'clauses', name: 'Clauses', icon: Shield },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/policies" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{policy.title}</h1>
              <p className="text-gray-600">{policy.policyNumber} • {policy.insuranceCompany}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="btn btn-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <Link to={`/policies/${id}/edit`} className="btn btn-primary">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-primary-500 bg-opacity-10">
                <FileText className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getPolicyTypeDisplay(policy.policyType)}
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
                  <dt className="text-sm font-medium text-gray-500">Premium</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {policy.premium ? formatCurrency(policy.premium) : 'N/A'}
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
                <Calendar className="h-6 w-6 text-warning-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Expiry</dt>
                  <dd className={`text-lg font-medium ${
                    getExpiryStatus(policy.endDate).color === 'danger' ? 'text-danger-600' :
                    getExpiryStatus(policy.endDate).color === 'warning' ? 'text-warning-600' : 'text-gray-900'
                  }`}>
                    {getExpiryStatus(policy.endDate).text}
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
                <AlertTriangle className="h-6 w-6 text-danger-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
                  <dd className={`text-lg font-medium ${
                    policy.aiAnalysis?.riskScore > 80 ? 'text-danger-600' :
                    policy.aiAnalysis?.riskScore > 60 ? 'text-warning-600' : 'text-success-600'
                  }`}>
                    {policy.aiAnalysis?.riskScore || 0}/100
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Basic Details</h4>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Policy Number:</dt>
                        <dd className="text-sm text-gray-900">{policy.policyNumber}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Insurance Company:</dt>
                        <dd className="text-sm text-gray-900">{policy.insuranceCompany}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Department:</dt>
                        <dd className="text-sm text-gray-900">{policy.department}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Company:</dt>
                        <dd className="text-sm text-gray-900">{policy.company}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Coverage Details</h4>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Coverage Amount:</dt>
                        <dd className="text-sm text-gray-900">
                          {policy.coverageAmount ? formatCurrency(policy.coverageAmount) : 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Premium:</dt>
                        <dd className="text-sm text-gray-900">
                          {policy.premium ? formatCurrency(policy.premium) : 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Start Date:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(policy.startDate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">End Date:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(policy.endDate)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {policy.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-600">{policy.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    {policy.aiAnalysis?.summary || 'AI analysis not available'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Items</h3>
                <div className="space-y-2">
                  {policy.aiAnalysis?.coverage?.length > 0 ? (
                    policy.aiAnalysis.coverage.map((item, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Shield className="h-5 w-5 text-success-500 mr-3" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No coverage items identified</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Factors</h3>
                <div className="space-y-2">
                  {policy.aiAnalysis?.risks?.length > 0 ? (
                    policy.aiAnalysis.risks.map((risk, index) => (
                      <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-danger-500 mr-3" />
                        <span className="text-gray-700">{risk}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No risk factors identified</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clauses' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Important Clauses</h3>
                <div className="space-y-4">
                  {policy.aiAnalysis?.clauses?.length > 0 ? (
                    policy.aiAnalysis.clauses.map((clause, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{clause.title}</h4>
                          <span className={`badge badge-${clause.importance === 'critical' ? 'danger' : clause.importance === 'high' ? 'warning' : 'gray'}`}>
                            {clause.importance}
                          </span>
                        </div>
                        <p className="text-gray-600">{clause.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No clauses identified</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex justify-center">
        <Link
          to={`/chat?policy=${id}`}
          className="btn btn-primary"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask AI About This Policy
        </Link>
      </div>
    </div>
  );
};

export default PolicyDetail;
