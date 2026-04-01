import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  Shield,
  AlertTriangle,
  TrendingUp,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatDate, formatCurrency, getPolicyTypeDisplay } from '../utils/utils';
import toast from 'react-hot-toast';

const ManagePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, [currentPage, searchTerm, filterType, filterRisk]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        type: filterType !== 'all' ? filterType : undefined,
        riskLevel: filterRisk !== 'all' ? filterRisk : undefined
      };

      const response = await apiService.admin.getAllPolicies(params);
      setPolicies(response.data.data.policies);
      setTotalPages(response.data.data.pagination.pages);
      setTotalPolicies(response.data.data.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Policies error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.admin.deletePolicy(policyId);
      toast.success('Policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete policy');
      console.error('Delete error:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleRiskFilter = (e) => {
    setFilterRisk(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPolicies(policies.map(p => p._id));
    } else {
      setSelectedPolicies([]);
    }
  };

  const handleSelectPolicy = (policyId) => {
    if (selectedPolicies.includes(policyId)) {
      setSelectedPolicies(selectedPolicies.filter(id => id !== policyId));
    } else {
      setSelectedPolicies([...selectedPolicies, policyId]);
    }
  };

  const exportPolicies = () => {
    const csvContent = [
      ['Title', 'Policy Number', 'Type', 'Company', 'Premium', 'Status', 'Uploaded By', 'Created At'].join(','),
      ...policies.map(p => [
        p.title,
        p.policyNumber,
        p.policyType,
        p.insuranceCompany,
        p.premium || '-',
        p.status,
        p.uploadedBy?.name || '-',
        formatDate(p.createdAt)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'policies.csv';
    a.click();
  };

  const getRiskColor = (riskScore) => {
    if (riskScore > 80) return 'danger';
    if (riskScore > 60) return 'warning';
    if (riskScore > 40) return 'primary';
    return 'success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activePolicies = policies.filter(p => p.status === 'active').length;
  const highRiskPolicies = policies.filter(p => (p.aiAnalysis?.riskScore || 0) > 60).length;
  const expiringSoon = policies.filter(p => p.daysUntilExpiry <= 30 && p.daysUntilExpiry > 0).length;

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Policies</p>
              <p className="text-2xl font-bold text-gray-900">{totalPolicies}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Policies</p>
              <p className="text-2xl font-bold text-gray-900">{activePolicies}</p>
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
              <p className="text-2xl font-bold text-gray-900">{highRiskPolicies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies by title or number..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="w-48 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={handleTypeFilter}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="health">Health</option>
                  <option value="life">Life</option>
                  <option value="auto">Auto</option>
                  <option value="home">Home</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="w-48 relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterRisk}
                  onChange={handleRiskFilter}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="0">Low (0-20)</option>
                  <option value="20">Medium (20-40)</option>
                  <option value="40">High (40-60)</option>
                  <option value="60">Critical (60-80)</option>
                  <option value="80">Severe (80+)</option>
                </select>
              </div>
            </div>
            <button
              onClick={exportPolicies}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedPolicies.length === policies.length && policies.length > 0}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPolicies.includes(policy._id)}
                      onChange={() => handleSelectPolicy(policy._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{policy.title}</div>
                        <div className="text-xs text-gray-500">{policy.policyNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getPolicyTypeDisplay(policy.policyType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.insuranceCompany}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.premium ? formatCurrency(policy.premium) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-16 h-2 rounded-full mr-2 ${
                        policy.aiAnalysis?.riskScore > 60 ? 'bg-red-500' : 
                        policy.aiAnalysis?.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${policy.aiAnalysis?.riskScore || 0}%`, maxWidth: '64px' }}
                      />
                      <span className="text-sm text-gray-600">
                        {Math.round(policy.aiAnalysis?.riskScore || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{policy.uploadedBy?.name}</div>
                    <div className="text-xs text-gray-500">{formatDate(policy.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/policies/${policy._id}`}
                        className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg"
                        title="View Policy"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => window.open(`/api/policy/${policy._id}/download`)}
                        className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded-lg"
                        title="Download Policy"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(policy._id)}
                        className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg"
                        title="Delete Policy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalPolicies)}</span> of{' '}
                <span className="font-medium">{totalPolicies}</span> policies
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePolicies;
