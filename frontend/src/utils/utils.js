import { format, parseISO, differenceInDays } from 'date-fns';
// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

// Format date
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format date with time
export const formatDateTime = (date, formatString = 'MMM dd, yyyy hh:mm a') => {
  if (!date) return 'N/A';
  try {
    return format(parseISO(date), formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

// Get relative time (e.g., "2 days ago", "in 3 days")
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    const now = new Date();
    const targetDate = parseISO(date);
    const days = differenceInDays(targetDate, now);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 0) return `In ${days} days`;
    return `${Math.abs(days)} days ago`;
  } catch (error) {
    return 'Invalid Date';
  }
};

// Check if date is expiring soon
export const isExpiringSoon = (endDate, daysThreshold = 30) => {
  if (!endDate) return false;
  try {
    const now = new Date();
    const expiry = parseISO(endDate);
    const daysUntilExpiry = differenceInDays(expiry, now);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= daysThreshold;
  } catch (error) {
    return false;
  }
};

// Get expiry status
export const getExpiryStatus = (endDate) => {
  if (!endDate) return { status: 'unknown', color: 'gray', text: 'Unknown' };
  
  try {
    const now = new Date();
    const expiry = parseISO(endDate);
    const daysUntilExpiry = differenceInDays(expiry, now);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'danger', text: 'Expired' };
    } else if (daysUntilExpiry === 0) {
      return { status: 'today', color: 'danger', text: 'Expires Today' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'critical', color: 'danger', text: `${daysUntilExpiry} days` };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'warning', text: `${daysUntilExpiry} days` };
    } else {
      return { status: 'safe', color: 'success', text: `${daysUntilExpiry} days` };
    }
  } catch (error) {
    return { status: 'error', color: 'gray', text: 'Invalid Date' };
  }
};

// Get risk level from score
export const getRiskLevel = (score) => {
  if (score === undefined || score === null) return { level: 'unknown', color: 'gray', text: 'Unknown' };
  
  if (score > 80) {
    return { level: 'high', color: 'danger', text: 'High Risk' };
  } else if (score > 60) {
    return { level: 'medium', color: 'warning', text: 'Medium Risk' };
  } else {
    return { level: 'low', color: 'success', text: 'Low Risk' };
  }
};

// Get compliance level from score
export const getComplianceLevel = (score) => {
  if (score === undefined || score === null) return { level: 'unknown', color: 'gray', text: 'Unknown' };
  
  if (score >= 85) {
    return { level: 'excellent', color: 'success', text: 'Excellent' };
  } else if (score >= 70) {
    return { level: 'good', color: 'success', text: 'Good' };
  } else {
    return { level: 'poor', color: 'danger', text: 'Poor' };
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert string to title case
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Get policy type display name
export const getPolicyTypeDisplay = (type) => {
  const types = {
    health: 'Health Insurance',
    life: 'Life Insurance',
    property: 'Property Insurance',
    liability: 'Liability Insurance',
    auto: 'Auto Insurance',
    business: 'Business Insurance',
    other: 'Other'
  };
  
  return types[type] || toTitleCase(type);
};

// Get alert type display name
export const getAlertTypeDisplay = (type) => {
  const types = {
    expiry: 'Expiry',
    compliance: 'Compliance',
    payment: 'Payment',
    risk: 'Risk'
  };
  return types[type] || 'Other';
};

// Get severity color
export const getSeverityColor = (severity) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'warning',
    critical: 'danger'
  };
  
  return colors[severity] || 'gray';
};

// Generate random color
export const generateColor = (index) => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];
  return colors[index % colors.length];
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Download file from blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Sort array by property
export const sortByProperty = (array, property, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'desc') {
      return b[property] > a[property] ? 1 : -1;
    }
    return a[property] > b[property] ? 1 : -1;
  });
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, properties) => {
  if (!searchTerm) return array;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return properties.some(property => {
      const value = item[property];
      return value && value.toString().toLowerCase().includes(lowerSearchTerm);
    });
  });
};
