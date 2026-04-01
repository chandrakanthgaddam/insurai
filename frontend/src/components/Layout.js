import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Upload, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X,
  Shield,
  Settings,
  Search
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/utils';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Policies', href: '/policies', icon: FileText },
    { name: 'Upload Policy', href: '/policies/upload', icon: Upload },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Add admin-only routes
  if (isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: Shield });
  }

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`hidden lg:flex lg:flex-shrink-0 ${sidebarOpen ? 'fixed inset-0 z-50 lg:relative' : ''}`}>
        <div className="flex flex-col w-64 h-full bg-white border-r border-gray-200">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">InsurAI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search policies, users, analytics..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2 hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}
    </div>
  );
};

export default Layout;
