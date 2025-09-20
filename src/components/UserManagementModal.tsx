import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Save, AlertCircle } from 'lucide-react';
import { supabase, createUserProfile } from '../lib/supabase';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  editUser?: any;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  onUserCreated,
  editUser 
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'customer' as 'admin' | 'sales_rep' | 'designer' | 'customer',
    company_name: '',
    specialties: '',
    is_active: true,
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editUser) {
      setFormData({
        full_name: editUser.full_name || '',
        email: editUser.email || '',
        phone: editUser.phone || '',
        role: editUser.role || 'customer',
        company_name: editUser.company_name || '',
        specialties: editUser.specialties ? editUser.specialties.join(', ') : '',
        is_active: editUser.is_active !== false,
        password: ''
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'customer',
        company_name: '',
        specialties: '',
        is_active: true,
        password: ''
      });
    }
    setError('');
  }, [editUser, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (editUser) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            is_active: formData.is_active
          })
          .eq('id', editUser.id);

        if (profileError) throw profileError;

        // Update role-specific tables
        if (formData.role === 'customer') {
          await supabase
            .from('customers')
            .upsert({
              id: editUser.id,
              company_name: formData.company_name || null
            });
        } else if (formData.role === 'sales_rep') {
          await supabase
            .from('sales_reps')
            .upsert({
              id: editUser.id,
              employee_id: editUser.employee_id || `SR${Date.now()}`,
              department: formData.company_name || 'Sales'
            });
        } else if (formData.role === 'designer') {
          const specialties = formData.specialties 
            ? formData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : ['Embroidery', 'Custom Stitching'];
            
          await supabase
            .from('designers')
            .upsert({
              id: editUser.id,
              employee_id: editUser.employee_id || `DS${Date.now()}`,
              specialties: specialties
            });
        }
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Create user profile
        const profileData = {
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          phone: formData.phone,
          is_active: formData.is_active
        };
        
        await createUserProfile(profileData);

        // Create role-specific records
        if (formData.role === 'customer') {
          await supabase.from('customers').insert({
            id: authData.user.id,
            company_name: formData.company_name || null,
            total_orders: 0,
            total_spent: 0
          });
        } else if (formData.role === 'sales_rep') {
          await supabase.from('sales_reps').insert({
            id: authData.user.id,
            employee_id: `SR${Date.now()}`,
            department: formData.company_name || 'Sales',
            commission_rate: 10.0,
            total_sales: 0,
            active_customers: 0
          });
        } else if (formData.role === 'designer') {
          const specialties = formData.specialties 
            ? formData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : ['Embroidery', 'Custom Stitching'];
            
          await supabase.from('designers').insert({
            id: authData.user.id,
            employee_id: `DS${Date.now()}`,
            specialties: specialties,
            hourly_rate: 50.0,
            total_completed: 0,
            average_rating: 0
          });
        }
      }

      onUserCreated();
      onClose();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {editUser ? 'Edit User' : 'Create New User'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={!!editUser}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="sales_rep">Sales Representative</option>
                  <option value="designer">Designer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {!editUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
            )}

            {(formData.role === 'customer' || formData.role === 'sales_rep') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.role === 'customer' ? 'Company Name' : 'Department'}
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {formData.role === 'designer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Embroidery, Logo Design, Custom Artwork"
                />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active User
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{editUser ? 'Update User' : 'Create User'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserManagementModal;