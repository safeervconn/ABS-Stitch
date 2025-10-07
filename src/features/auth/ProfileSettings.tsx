import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getUserProfile, getDashboardRoute } from '../../core/api/supabase';
import { User, Lock, Mail, Phone, Building, Shield, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../core/utils/toast';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  company_name?: string;
}

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
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

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const passwordStrengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const passwordStrengthColor = ['red', 'orange', 'yellow', 'blue', 'green'][passwordStrength];
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const profile = await getUserProfile(user.id);

      if (!profile) {
        setMessage({ type: 'error', text: 'Profile not found' });
        return;
      }

      const role = 'role' in profile && profile.role !== 'customer' ? profile.role : 'customer';
      const data: UserData = {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        role,
        company_name: 'company_name' in profile ? profile.company_name : undefined,
      };

      setUserData(data);
      setFormData({
        full_name: data.full_name,
        phone: data.phone || '',
      });
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    try {
      setSaving(true);
      setMessage(null);

      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        updated_at: new Date().toISOString(),
      };

      const table = userData.role === 'customer' ? 'customers' : 'employees';

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', userData.id);

      if (error) throw error;

      setUserData({
        ...userData,
        ...formData,
      });

      toast.success('Profile updated successfully');
      setMessage(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.newPassword.trim()) {
      setMessage({ type: 'error', text: 'New password is required' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }


    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password updated successfully');
      setMessage(null);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const route = getDashboardRoute(userData?.role || '');
    navigate(route || '/');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'sales_rep':
        return 'Sales Representative';
      case 'designer':
        return 'Designer';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <User className="w-8 h-8 mr-3" />
              Profile Settings
            </h1>
            <p className="text-blue-100 mt-2">Manage your personal information and security</p>
          </div>

          {message && (
            <div className={`mx-6 mt-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="p-6 space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded border border-gray-300">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="flex-1 bg-transparent text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                  <div className="flex items-center bg-gray-100 px-3 py-2 rounded border border-gray-300">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={getRoleLabel(userData.role)}
                      disabled
                      className="flex-1 bg-transparent text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Role is managed by administrators</p>
                </div>
                {userData.company_name && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                    <div className="flex items-center bg-gray-100 px-3 py-2 rounded border border-gray-300">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <input
                        type="text"
                        value={userData.company_name}
                        disabled
                        className="flex-1 bg-transparent text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className="border-t pt-6">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {passwordData.newPassword && (
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
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {passwordData.confirmPassword && (
                        <div className="mt-2">
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <p className="text-xs text-green-600 flex items-center">
                              <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                              Passwords match
                            </p>
                          ) : (
                            <p className="text-xs text-red-600">Passwords do not match</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
