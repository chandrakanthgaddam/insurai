import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import AuthLayout from './components/AuthLayout';

// Route Protection
import { AdminRoute, UserRoute, PublicRoute } from './components/ProtectedRoutes';

// Page Components
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import UploadPolicy from './pages/UploadPolicy';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import ManageUsers from './pages/ManageUsers';
import ManagePolicies from './pages/ManagePolicies';

// Hooks
import { useAuth } from './hooks/useAuth';

// Dashboard redirect component
const DashboardRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <AuthLayout>
                <Register />
              </AuthLayout>
            </PublicRoute>
          } />

          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="policies" element={<ManagePolicies />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>

          {/* User Routes - Protected */}
          <Route path="/user" element={
            <UserRoute>
              <UserLayout />
            </UserRoute>
          }>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="policies" element={<Policies />} />
            <Route path="policies/:id" element={<PolicyDetail />} />
            <Route path="policies/upload" element={<UploadPolicy />} />
            <Route path="chat" element={<Chat />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Legacy Routes - Redirect to new structure */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/policies" element={<Navigate to="/user/policies" replace />} />
          <Route path="/policies/upload" element={<Navigate to="/user/policies/upload" replace />} />
          <Route path="/policies/:id" element={<Navigate to="/user/policies/:id" replace />} />
          <Route path="/chat" element={<Navigate to="/user/chat" replace />} />
          <Route path="/alerts" element={<Navigate to="/user/alerts" replace />} />
          <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
          <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />

          {/* Root Route */}
          <Route path="/" element={<DashboardRedirect />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
