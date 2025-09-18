import React, { useState } from 'react';
import { Users, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { createDemoUsers } from '../lib/supabase';

const DemoUserCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleCreateDemoUsers = async () => {
    setIsCreating(true);
    setStatus('idle');
    setMessage('');

    try {
      await createDemoUsers();
      setStatus('success');
      setMessage('Demo users created successfully! Check the console for credentials.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to create demo users');
      console.error('Error creating demo users:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Demo Users</h3>
            <p className="text-xs text-gray-600">Create test accounts</p>
          </div>
        </div>

        {status === 'success' && (
          <div className="flex items-center space-x-2 mb-3 p-2 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center space-x-2 mb-3 p-2 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{message}</span>
          </div>
        )}

        <button
          onClick={handleCreateDemoUsers}
          disabled={isCreating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Create Demo Users</span>
            </>
          )}
        </button>

        <div className="mt-3 text-xs text-gray-500">
          <p className="font-medium mb-1">Test Credentials:</p>
          <p>admin@absstitch.com</p>
          <p>sales@absstitch.com</p>
          <p>designer@absstitch.com</p>
          <p>customer@absstitch.com</p>
          <p className="mt-1 font-medium">Password: SecureXXX123!</p>
        </div>
      </div>
    </div>
  );
};

export default DemoUserCreator;