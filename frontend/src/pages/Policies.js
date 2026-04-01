import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatDate, formatCurrency, getExpiryStatus, getRiskLevel, getPolicyTypeDisplay } from '../utils/utils';
import toast from 'react-hot-toast';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPolicies();
  }, [searchTerm, filterType, sortBy, currentPage]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        policyType: filterType !== 'all' ? filterType : undefined,
        sortBy,
        sortOrder: 'desc'
      };

      const response = await apiService.policies.getAll(params);
      setPolicies(response.data.data.policies);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch policies');
      console.error('Policies error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await apiService.policies.delete(policyId);
      toast.success('Policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete policy');
      console.error('Delete error:', error);
    }
  };

  const handleDownload = async (policyId, fileName) => {
    try {
      const response = await apiService.policies.download(policyId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download policy');
      console.error('Download error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      expired: 'danger',
      pending: 'warning',
      cancelled: 'gray'
    };
    return `badge-${statusColors[status] || 'gray'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
            <p className="mt-2 text-gray-600">Manage your insurance policies</p>
          </div>
          <Link to="/policies/upload" className="btn btn-primary">
            <Upload className="h-4 w-4 mr-2" />
            Upload Policy
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Filter by type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="health">Health</option>
              <option value="life">Life</option>
              <option value="property">Property</option>
              <option value="liability">Liability</option>
              <option value="auto">Auto</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="endDate">Expiry Date</option>
              <option value="premium">Premium</option>
              <option value="aiAnalysis.riskScore">Risk Score</option>
            </select>

            {/* Refresh button */}
            <button
              onClick={fetchPolicies}
              className="btn btn-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.length > 0 ? (
                policies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/policies/${policy._id}`} className="hover:text-primary-600">
                              {policy.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">
                            {policy.policyNumber} • {policy.insuranceCompany}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-gray">
                        {getPolicyTypeDisplay(policy.policyType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {policy.premium ? formatCurrency(policy.premium) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(policy.endDate)}
                          </div>
                          <div className={`text-xs ${getExpiryStatus(policy.endDate).color === 'danger' ? 'text-danger-600' : getExpiryStatus(policy.endDate).color === 'warning' ? 'text-warning-600' : 'text-gray-500'}`}>
                            {getExpiryStatus(policy.endDate).text}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          policy.aiAnalysis?.riskScore > 80 ? 'bg-danger-500' :
                          policy.aiAnalysis?.riskScore > 60 ? 'bg-warning-500' : 'bg-success-500'
                        }`}></div>
                        <span className={`text-sm ${
                          policy.aiAnalysis?.riskScore > 80 ? 'text-danger-600' :
                          policy.aiAnalysis?.riskScore > 60 ? 'text-warning-600' : 'text-success-600'
                        }`}>
                          {policy.aiAnalysis?.riskScore || 0}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/policies/${policy._id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDownload(policy._id, policy.fileName)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/policies/${policy._id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(policy._id)}
                          className="text-danger-600 hover:text-danger-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                      <p className="text-gray-500 mb-4">Get started by uploading your first insurance policy</p>
                      <Link to="/policies/upload" className="btn btn-primary">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Policy
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Policies;
