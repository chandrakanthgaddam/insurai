import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center">
              <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="ml-3 text-3xl font-bold text-gray-900">InsurAI</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Corporate Policy Automation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered insurance policy analysis and intelligence
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 InsurAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
