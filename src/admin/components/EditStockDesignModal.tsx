import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Upload, Trash2, Eye, Package } from 'lucide-react';
import { createStockDesign, updateStockDesign, getCategories, deleteFileFromStorage } from '../api/supabaseHelpers';
import { AdminStockDesign, Category } from '../types';
import { supabase } from '../../lib/supabase';
import { toast } from '../../utils/toast';

interface EditStockDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockDesign: AdminStockDesign | null;
  onSuccess: () => void;
  mode: 'create' | 'edit';
}

const EditStockDesignModal: React.FC<EditStockDesignModalProps> = ({
  isOpen,
  onClose,
  stockDesign,
  onSuccess,
  mode,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && stockDesign) {
        // Initialize form data for editing
        setFormData({
          title: stockDesign.title,
          description: stockDesign.description || '',
          category_id: stockDesign.category_id || '',
          price: stockDesign.price,
          status: stockDesign.status,
        });
        setExistingImageUrl(stockDesign.image_url || '');
      } else {
        // Initialize form data for creation
        setFormData({
          title: '',
          description: '',
          category_id: '',
          price: 0,
          status: 'active',
        });
        setExistingImageUrl('');
      }

      setNewImageFile(null);
      setImageToDelete('');
      setError('');
      fetchCategories();
    }
  }, [isOpen, mode, stockDesign]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      // Mark existing image for deletion if we're replacing it
      if (existingImageUrl) {
        setImageToDelete(existingImageUrl);
      }
    }
  };

  const removeCurrentImage = () => {
    if (newImageFile) {
      // Remove newly selected file
      setNewImageFile(null);
      setImageToDelete('');
    } else if (existingImageUrl) {
      // Mark existing image for deletion
      setImageToDelete(existingImageUrl);
      setExistingImageUrl('');
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!newImageFile) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', newImageFile);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-stock-design-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const result = await response.json();
      return result.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Stock Design title is required');
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let finalImageUrl = existingImageUrl;

      // Upload new image if selected
      if (newImageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      // Delete old image if marked for deletion
      if (imageToDelete) {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            // Extract storage path from the URL
            const urlParts = imageToDelete.split('/stock-design-images/');
            const storagePath = urlParts.length > 1 ? urlParts[1] : null;

            if (storagePath) {
              const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-stock-design-image?storagePath=${encodeURIComponent(storagePath)}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                }
              );

              if (!response.ok) {
                console.warn('Failed to delete old image:', await response.text());
              }
            }
          }
        } catch (error) {
          console.warn('Error deleting old image:', error);
          // Don't throw - allow the update to proceed even if deletion fails
        }
      }

      // Create or update stock design
      const stockDesignData = {
        ...formData,
        image_url: finalImageUrl || null,
      };

      if (mode === 'create') {
        await createStockDesign(stockDesignData);
        toast.success('Stock Design created successfully');
      } else if (stockDesign) {
        await updateStockDesign(stockDesign.id, stockDesignData);
        toast.success('Stock Design updated successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving stock design:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} stock design`);
      setError('Failed to save stock design. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentImageUrl = () => {
    if (newImageFile) {
      return URL.createObjectURL(newImageFile);
    }
    return existingImageUrl;
  };

  const hasImage = () => {
    return newImageFile || existingImageUrl;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Add New Stock Design' : 'Edit Stock Design'}
              </h2>
              {mode === 'edit' && stockDesign && (
                <p className="text-gray-600">{stockDesign.title}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner mr-2"></div>
                <span className="text-gray-600">Loading stock design data...</span>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Stock Design Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Design Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter stock design title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">No Type</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter stock design description"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Design Image
                  </label>
                  
                  {/* Current Image Preview */}
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img
                        src={hasImage() ? getCurrentImageUrl() : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+PC9zdmc+'}
                        alt={hasImage() ? "stock design preview" : "No image"}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                      {hasImage() && (
                        <button
                          type="button"
                          onClick={removeCurrentImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {newImageFile && (
                      <p className="text-sm text-green-600 mt-2">
                        New image selected: {newImageFile.name}
                      </p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span>
                        {hasImage() ? 'Replace image' : 'Click to upload stock design image'}
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-sm flex items-center space-x-2"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner-white w-4 h-4"></div>
                    <span>{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'create' ? 'Create Stock Design' : 'Update Stock Design'}</span>
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

export default EditStockDesignModal;