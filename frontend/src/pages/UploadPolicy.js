import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, FileText, AlertCircle, CloudUpload } from 'lucide-react';
import { apiService } from '../services/api';
import { getPolicyTypeDisplay } from '../utils/utils';
import toast from 'react-hot-toast';

const UploadPolicy = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleFileSelect = (file) => {
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a PDF or DOCX file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      // Add file
      formData.append('policyFile', selectedFile);

      const response = await apiService.policies.upload(formData);
      
      setUploadProgress(100);
      toast.success('Policy uploaded and analyzed successfully!');
      
      setTimeout(() => {
        navigate('/policies');
      }, 1500);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload policy');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Policy</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload and analyze your insurance policy with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CloudUpload className="h-6 w-6 mr-2 text-primary-600" />
                Upload Policy Document
              </h2>
              
              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {!selectedFile ? (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drag & drop your policy document here
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports PDF and DOCX files (max 10MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-primary-600" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Selection Button */}
              <div className="mt-6">
                <label className="block w-full">
                  <span className="sr-only">Choose file</span>
                  <div className="flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose File
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Policy Details Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Policy Details</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Policy title is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter policy title"
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-danger-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    {...register('policyNumber', { required: 'Policy number is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., POL-123456789"
                  />
                  {errors.policyNumber && (
                    <p className="mt-2 text-sm text-danger-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.policyNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Company *
                  </label>
                  <input
                    type="text"
                    {...register('insuranceCompany', { required: 'Insurance company is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., State Farm, Allstate"
                  />
                  {errors.insuranceCompany && (
                    <p className="mt-2 text-sm text-danger-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.insuranceCompany.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type *
                  </label>
                  <select
                    {...register('policyType', { required: 'Policy type is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select policy type</option>
                    <option value="health">Health Insurance</option>
                    <option value="life">Life Insurance</option>
                    <option value="auto">Auto Insurance</option>
                    <option value="home">Home Insurance</option>
                    <option value="business">Business Insurance</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.policyType && (
                    <p className="mt-2 text-sm text-danger-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.policyType.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage Amount
                    </label>
                    <input
                      type="number"
                      {...register('coverageAmount')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Premium
                    </label>
                    <input
                      type="number"
                      {...register('premium')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      {...register('startDate', { required: 'Start date is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      {...register('endDate', { required: 'End date is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter policy description (optional)"
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Upload and Analyze Policy
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                <span className="text-lg font-medium text-gray-900">Uploading Policy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Analyzing policy with AI... This may take a moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPolicy;
