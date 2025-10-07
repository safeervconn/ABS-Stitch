/**
 * Reset Password Page Component
 * 
 * Features:
 * - New password form with confirmation
 * - Password strength indicator
 * - Supabase auth integration for password update
 * - Success/error handling with proper UI feedback
 * - Consistent design with login/signup pages
 * - Automatic session handling from email link
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../core/api/supabase';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordStrengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const passwordStrengthColor = ['red', 'orange', 'yellow', 'blue', 'green'][passwordStrength];

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setSessionError(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setSessionError(true);
      }
    };

    checkSession();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.message.includes('session_not_found')) {
        setError('Password reset link has expired or is invalid. Please request a new reset link.');
      } else if (err.message.includes('same_password')) {
        setError('New password must be different from your current password.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  // Show session error if reset link is invalid
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background spotlight effects */}
        <div className="absolute inset-0">
          <div className="spotlight spotlight-1"></div>
          <div className="spotlight spotlight-2"></div>
          <div className="spotlight spotlight-3"></div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="glass rounded-2xl shadow-2xl p-8 text-center relative z-10">
            <div className="bg-gradient-to-r from-red-100 to-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              This password reset link has expired or is invalid. Please request a new password reset link.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/forgot-password'}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-xl font-semibold transform hover:scale-105"
              >
                Request New Reset Link
              </button>
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background spotlight effects */}
        <div className="absolute inset-0">
          <div className="spotlight spotlight-1"></div>
          <div className="spotlight spotlight-2"></div>
          <div className="spotlight spotlight-3"></div>
        </div>
        
        <div className="max-w-md w-full">
          <div className="glass rounded-2xl shadow-2xl p-8 text-center relative z-10">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Password Reset Successful!</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl font-semibold transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background spotlight effects */}
      <div className="absolute inset-0">
        <div className="spotlight spotlight-1"></div>
        <div className="spotlight spotlight-2"></div>
        <div className="spotlight spotlight-3"></div>
      </div>
      
      <div className="max-w-md w-full">
        
        {/* Back to Login */}
        <button 
          onClick={handleBackToLogin}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 relative z-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Login</span>
        </button>

        {/* Reset Password Card */}
        <div className="glass rounded-2xl shadow-2xl p-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h1>
            <p className="text-gray-600">Create a strong password for your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all bg-${passwordStrengthColor}-500`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs text-${passwordStrengthColor}-600`}>
                      {passwordStrengthText}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <a href="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all">
                Sign In
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;