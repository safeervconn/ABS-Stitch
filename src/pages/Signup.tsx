/**
 * Signup Page Component
 * 
 * Features:
 * - User registration with role selection
 * - Form validation
 * - Password strength indicator
 * - Terms and conditions acceptance
 * - Automatic profile creation
 * - Matches sign-in page design exactly
 */

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { signUp, createUserProfile, createCustomerProfile, supabase } from '../lib/supabase';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company_name: '', // Optional company name for customers
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const passwordStrengthColor = ['red', 'orange', 'yellow', 'blue', 'green'][passwordStrength];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
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
      const { user, session } = await signUp(formData.email, formData.password);

      if (!user) {
        throw new Error('User creation failed');
      }

      if (!session) {
        setError('Account created! Please check your email to verify your account before logging in.');
        setIsLoading(false);
        return;
      }

      try {
        const customerData: any = {
          id: user.id,
          email: formData.email,
          full_name: formData.full_name
        };

        if (formData.phone?.trim()) {
          customerData.phone = formData.phone.trim();
        }

        if (formData.company_name?.trim()) {
          customerData.company_name = formData.company_name.trim();
        }

        await createCustomerProfile(customerData);
        setSuccess(true);
      } catch (profileError: any) {
        console.error('Error creating customer profile:', profileError);

        if (profileError.message?.includes('duplicate key') || profileError.code === '23505') {
          setError('An account with this email already exists. Please try logging in.');
        } else if (profileError.message?.includes('No active session')) {
          setError('Session creation failed. Please try again.');
        } else if (profileError.code === 'PGRST301' || profileError.message?.includes('JWT')) {
          setError('Authentication error. Please try again.');
        } else {
          setError(profileError.message || 'Profile setup failed. Please try logging in or contact support.');
        }

        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error('Signup error:', err);

      if (err.message?.includes('already registered')) {
        setError('This email is already registered. Please try logging in.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Account Created!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been successfully created. You can now sign in to access your dashboard.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full btn-success btn-large"
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
        
        {/* Back to Homepage */}
        <button 
          onClick={handleBackToHome}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 relative z-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Homepage</span>
        </button>

        {/* Signup Card */}
        <div className="glass rounded-2xl shadow-2xl p-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join ABS STITCH today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>


            {/* Company Name (Optional for customers) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                placeholder="Enter your company name"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Create a password"
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
              {formData.password && (
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
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
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
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-success btn-large"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
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

export default Signup;