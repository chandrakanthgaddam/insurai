import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Mail, Building, Briefcase, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        department: user.department,
        company: user.company,
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    try {
      setIsLoading(true);
      await apiService.auth.updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setIsLoading(true);
      await apiService.auth.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card mb-8">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xl font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'gray'}`}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
                <span className="text-sm text-gray-500">
                  {user.department} • {user.company}
                </span>
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
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerProfile('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      type="text"
                      className={`input pl-10 ${profileErrors.name ? 'border-danger-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerProfile('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className={`input pl-10 ${profileErrors.email ? 'border-danger-500' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.email.message}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerProfile('department', {
                        required: 'Department is required',
                      })}
                      type="text"
                      className={`input pl-10 ${profileErrors.department ? 'border-danger-500' : ''}`}
                      placeholder="Enter your department"
                    />
                  </div>
                  {profileErrors.department && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.department.message}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerProfile('company', {
                        required: 'Company is required',
                      })}
                      type="text"
                      className={`input pl-10 ${profileErrors.company ? 'border-danger-500' : ''}`}
                      placeholder="Enter your company name"
                    />
                  </div>
                  {profileErrors.company && (
                    <p className="mt-1 text-sm text-danger-600">{profileErrors.company.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerPassword('currentPassword', {
                          required: 'Current password is required',
                        })}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className={`input pl-10 pr-10 ${passwordErrors.currentPassword ? 'border-danger-500' : ''}`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerPassword('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                          },
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className={`input pl-10 pr-10 ${passwordErrors.newPassword ? 'border-danger-500' : ''}`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerPassword('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === watch('newPassword') || 'Passwords do not match',
                        })}
                        type="password"
                        className={`input pl-10 ${passwordErrors.confirmPassword ? 'border-danger-500' : ''}`}
                        placeholder="Confirm new password"
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Account Actions */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={logout}
                    className="btn btn-danger"
                  >
                    Sign Out
                  </button>
                  <p className="text-sm text-gray-500">
                    Signing out will end your current session and you'll need to log in again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
