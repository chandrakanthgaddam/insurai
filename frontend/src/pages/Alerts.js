import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Filter,
  Check,
  X,
  Search,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatDate, formatDateTime, getAlertTypeDisplay, getSeverityColor } from '../utils/utils';
import toast from 'react-hot-toast';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAlerts();
  }, [filterType, filterSeverity, searchTerm, currentPage]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        type: filterType !== 'all' ? filterType : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        search: searchTerm || undefined,
      };

      const response = await apiService.dashboard.getAlerts(params);
      setAlerts(response.data.data.alerts);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch alerts');
      console.error('Alerts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlert = (alertId) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map(alert => alert._id)));
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedAlerts.size === 0) {
      toast.error('Please select alerts to mark as read');
      return;
    }

    try {
      // Group alerts by policy ID
      const alertsByPolicy = {};
      alerts.forEach(alert => {
        if (selectedAlerts.has(alert._id)) {
          if (!alertsByPolicy[alert.policyId]) {
            alertsByPolicy[alert.policyId] = [];
          }
          alertsByPolicy[alert.policyId].push(alert._id);
        }
      });

      // Mark alerts as read for each policy
      const promises = Object.entries(alertsByPolicy).map(([policyId, alertIds]) =>
        apiService.dashboard.markAlertsRead(policyId, Array.from(alertIds))
      );

      await Promise.all(promises);
      
      toast.success(`${selectedAlerts.size} alerts marked as read`);
      setSelectedAlerts(new Set());
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to mark alerts as read');
      console.error('Mark as read error:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-danger-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-warning-500" />;
      case 'medium':
        return <Bell className="h-4 w-4 text-warning-500" />;
      case 'low':
        return <Bell className="h-4 w-4 text-success-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeColor = (severity) => {
    const colors = {
      critical: 'danger',
      high: 'warning',
      medium: 'warning',
      low: 'success'
    };
    return `badge-${colors[severity] || 'gray'}`;
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
            <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
            <p className="mt-2 text-gray-600">Manage and monitor policy alerts and notifications</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAlerts}
              className="btn btn-secondary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleMarkAsRead}
              disabled={selectedAlerts.size === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark as Read ({selectedAlerts.size})
            </button>
          </div>
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
                placeholder="Search alerts..."
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
              <option value="expiry">Expiry</option>
              <option value="compliance">Compliance</option>
              <option value="payment">Payment</option>
              <option value="risk">Risk</option>
            </select>

            {/* Filter by severity */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Select All */}
            <button
              onClick={handleSelectAll}
              className="btn btn-outline"
            >
              {selectedAlerts.size === alerts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert._id} className={`hover:bg-gray-50 ${!alert.isRead ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert._id)}
                        onChange={() => handleSelectAlert(alert._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {alert.message}
                          </p>
                          {!alert.isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-gray">
                        {getAlertTypeDisplay(alert.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {alert.policyTitle}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDateTime(alert.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Bell className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || filterType !== 'all' || filterSeverity !== 'all'
                          ? 'Try adjusting your filters'
                          : 'All caught up! No new alerts.'}
                      </p>
                      {(searchTerm || filterType !== 'all' || filterSeverity !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterSeverity('all');
                          }}
                          className="btn btn-secondary"
                        >
                          Clear Filters
                        </button>
                      )}
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

      {/* Alert Summary */}
      {alerts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-danger-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-danger-900">Critical</p>
                <p className="text-lg font-bold text-danger-900">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-warning-900">High</p>
                <p className="text-lg font-bold text-warning-900">
                  {alerts.filter(a => a.severity === 'high').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Medium</p>
                <p className="text-lg font-bold text-blue-900">
                  {alerts.filter(a => a.severity === 'medium').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-success-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-success-900">Low</p>
                <p className="text-lg font-bold text-success-900">
                  {alerts.filter(a => a.severity === 'low').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
