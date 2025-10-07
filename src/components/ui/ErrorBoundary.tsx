/**
 * Error Boundary Component
 * 
 * React error boundary for graceful error handling and
 * improved user experience when components fail.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  /**
   * Reset error state
   */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Navigate to home page
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                We encountered an unexpected error. Please try refreshing the page or return to the homepage.
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  fullWidth
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  fullWidth
                  icon={<Home className="h-4 w-4" />}
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}