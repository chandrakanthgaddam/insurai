import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Upload, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut,
  Menu,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Policies', href: '/policies', icon: FileText },
    { name: 'Upload Policy', href: '/policies/upload', icon: Upload },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Clean, minimal design for users */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 h-full bg-white border-r border-gray-200">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-xl font-bold text-gray-900">InsurAI</span>
          </div>

          {/* Navigation - Simple and clean */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}`} />
                  </div>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info Card */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation - Clean and minimal */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none"
                >
                  <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Clean, starts at top */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75" />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">InsurAI</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
