import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Building, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Or{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          sign in to your existing account
        </Link>
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                type="text"
                autoComplete="name"
                className={`appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className={`appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 4,
                    message: 'Password must be at least 4 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register('role')}
                className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                defaultValue="user"
              >
                <option value="user">User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select 'Administrator' for admin access
            </p>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('department')}
                type="text"
                autoComplete="organization"
                className={`input pl-10 ${errors.department ? 'border-danger-500 focus:border-danger-500' : ''}`}
                placeholder="Enter your department (optional)"
              />
            </div>
            {errors.department && (
              <p className="mt-1 text-sm text-danger-600">{errors.department.message}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-white rounded-l-md z-10">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('company')}
                type="text"
                autoComplete="organization"
                className={`input pl-10 ${errors.company ? 'border-danger-500 focus:border-danger-500' : ''}`}
                placeholder="Enter your company (optional)"
              />
            </div>
            {errors.company && (
              <p className="mt-1 text-sm text-danger-600">{errors.company.message}</p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;
