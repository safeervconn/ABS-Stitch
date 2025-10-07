/**
 * Login Page Component
 * 
 * Features:
 * - Secure email/password authentication
 * - Form validation
 * - Error handling
 * - Redirect to appropriate dashboard based on role
 * - Link to signup page
 */

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { signInWithStatusCheck, getUserProfile, getDashboardRoute } from '../lib/supabase';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Login page component with SEO optimization and performance enhancements
 */
const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle form input changes with error clearing
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  /**
   * Handle form submission with comprehensive error handling
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user } = await signInWithStatusCheck(formData.email, formData.password);
      
      if (user) {
        // Wait for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Get user profile to determine role
          const profile = await getUserProfile(user.id);
          if (profile) {
            // Validate role and redirect to appropriate dashboard
            const dashboardRoute = getDashboardRoute(profile.role);
            if (dashboardRoute) {
              window.location.href = dashboardRoute;
            } else {
              setError(`Invalid user role: ${profile.role}. Please contact support.`);
              return;
            }
          } else {
            setError('User profile not found. This may be a new account that needs setup. Please contact support.');
            return;
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          setError('Failed to load user profile. Please try again or contact support if the problem persists.');
          return;
        }
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (err.message.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate back to homepage
   */
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <PageLayout seoPage="login">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background spotlight effects */}
        <div className="absolute inset-0">
          <div className="spotlight spotlight-1"></div>
          <div className="spotlight spotlight-2"></div>
          <div className="spotlight spotlight-3"></div>
        </div>
        
        <div className="max-w-md w-full">

          {/* Back to Homepage */}
          <Button
            onClick={handleBackToHome}
            variant="ghost"
            icon={<ArrowLeft className="h-5 w-5" />}
            className="mb-8 relative z-10"
            animation="none"
          >
            Back to Homepage
          </Button>

          {/* Login Card */}
          <Card
            background="glass"
            shadow="xl"
            rounded="2xl"
            entranceAnimation="scaleIn"
            className="relative z-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your ABS STITCH account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm focus-ring"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm focus-ring"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot your password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                variant="success"
                size="lg"
                fullWidth
                animation="lift"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all">
                  Create Account
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;

  );
};

export default Login;