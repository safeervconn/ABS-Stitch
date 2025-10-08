import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Upload, Trash2, Eye, Package } from 'lucide-react';
import { createProduct, updateProduct, getApparelTypes, deleteFileFromStorage } from '../api/supabaseHelpers';
import { AdminProduct, ApparelType } from '../types';
import { supabase } from '../../lib/supabase';
import { toast } from '../../utils/toast';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProduct | null;
  onSuccess: () => void;
  mode: 'create' | 'edit';
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
  mode,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    apparel_type_id: '',
    price: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string>('');
  const [apparelTypes, setApparelTypes] = useState<ApparelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        // Initialize form data for editing
        setFormData({
          title: product.title,
          description: product.description || '',
          apparel_type_id: product.apparel_type_id || '',
          price: product.price,
          status: product.status,
        });
        setExistingImageUrl(product.image_url || '');
      } else {
        // Initialize form data for creation
        setFormData({
          title: '',
          description: '',
          apparel_type_id: '',
          price: 0,
          status: 'active',
        });
        setExistingImageUrl('');
      }

      setNewImageFile(null);
      setImageToDelete('');
      setError('');
      fetchApparelTypes();
    }
  }, [isOpen, mode, product]);

  const fetchApparelTypes = async () => {
    try {
      setLoading(true);
      const apparelTypesData = await getApparelTypes();
      setApparelTypes(apparelTypesData);
    } catch (error) {
      console.error('Error fetching apparel types:', error);
      setError('Failed to load apparel types');
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

    const fileExt = newImageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, newImageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(`Failed to upload image: ${newImageFile.name}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Product title is required');
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
        await deleteFileFromStorage(imageToDelete, 'product-images');
      }

      // Create or update product
      const productData = {
        ...formData,
        image_url: finalImageUrl || null,
      };

      if (mode === 'create') {
        await createProduct(productData);
        toast.success('Product created successfully');
      } else if (product) {
        await updateProduct(product.id, productData);
        toast.success('Product updated successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} product`);
      setError('Failed to save product. Please try again.');
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
                {mode === 'create' ? 'Add New Product' : 'Edit Product'}
              </h2>
              {mode === 'edit' && product && (
                <p className="text-gray-600">{product.title}</p>
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
                <span className="text-gray-600">Loading product data...</span>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Product Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter product title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apparel Type *
                    </label>
                    <select
                      name="apparel_type_id"
                      value={formData.apparel_type_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">No Type</option>
                      {apparelTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.type_name}
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
                    placeholder="Enter product description"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  
                  {/* Current Image Preview */}
                  {hasImage() && (
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <img
                          src={getCurrentImageUrl()}
                          alt="Product preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeCurrentImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {newImageFile && (
                        <p className="text-sm text-green-600 mt-2">
                          New image selected: {newImageFile.name}
                        </p>
                      )}
                    </div>
                  )}

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
                        {hasImage() ? 'Replace image' : 'Click to upload product image'}
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
                    <span>{mode === 'create' ? 'Create Product' : 'Update Product'}</span>
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

export default EditProductModal;