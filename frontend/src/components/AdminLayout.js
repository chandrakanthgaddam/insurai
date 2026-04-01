import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Shield,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
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
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Policies', href: '/admin/policies', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/admin/alerts', icon: Bell },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-6 border-b border-slate-800">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="ml-3 text-xl font-bold text-white">InsurAI</span>
            <span className="ml-2 px-2 py-1 text-xs font-semibold text-blue-400 bg-blue-400/10 rounded-full">ADMIN</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="ml-3">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                </Link>
              );
            })}
          </nav>

          {/* Admin Info */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="max-w-lg w-full lg:max-w-xs ml-4 lg:ml-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users, policies, data..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - No extra padding at top */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75" />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-slate-900">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
              <span className="text-xl font-bold text-white">InsurAI</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-3 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
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

export default AdminLayout;
