import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Eye, Package } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import EditProductModal from '../components/EditProductModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { createProduct, updateProduct, deleteProduct, getApparelTypes } from '../api/supabaseHelpers';
import { AdminProduct, ApparelType, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';
import { getProducts } from '../api/supabaseHelpers';
import { toast } from '../../utils/toast';
import { getPlaceholderImage } from '../../lib/placeholderImages';

const ProductsTab: React.FC = () => {
  // Use the new paginated data hook
  const { data: products, params, loading, error, updateParams, refetch } = usePaginatedData(
    getProducts,
    {
      page: 1,
      limit: 25,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
  );

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    apparelType: '',
    status: '',
    priceMin: '',
    priceMax: '',
  });

  // Initial params for reset
  const [initialParams] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  
  // Confirmation modal states
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  
  // Apparel types for dropdown
  const [apparelTypes, setApparelTypes] = useState<ApparelType[]>([]);

  useEffect(() => {
    const fetchApparelTypes = async () => {
      try {
        const apparelTypesData = await getApparelTypes();
        setApparelTypes(apparelTypesData);
      } catch (error) {
        console.error('Error fetching apparel types:', error);
      }
    };
    
    fetchApparelTypes();
  }, []);

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'apparelType',
      label: 'Apparel Type',
      options: apparelTypes.map(type => ({ value: type.id, label: type.type_name })),
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'priceMin',
      label: 'Min Price',
      type: 'number' as const,
      placeholder: 'Min $',
    },
    {
      key: 'priceMax',
      label: 'Max Price',
      type: 'number' as const,
      placeholder: 'Max $',
    },
  ];

  const handleParamsChange = (newParams: Partial<PaginationParams>) => {
    updateParams(newParams);
  };

  const handleSearch = (search: string) => {
    updateParams({ search, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    // Apply filters to search params
    const newParams: Partial<PaginationParams> = { page: 1 };
    
    if (key === 'apparelType' && value) {
      newParams.apparelTypeId = value;
    } else if (key === 'status' && value) {
      newParams.status = value;
    } else if (key === 'priceMin' && value) {
      newParams.priceMin = parseFloat(value);
    } else if (key === 'priceMax' && value) {
      newParams.priceMax = parseFloat(value);
    }
    
    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      apparelType: '',
      status: '',
      priceMin: '',
      priceMax: '',
    });
    const resetParams: PaginationParams = {
      ...initialParams,
      apparelTypeId: undefined,
      status: undefined,
      priceMin: undefined,
      priceMax: undefined,
    };
    updateParams(resetParams);
  };

  const handleCreateProduct = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    setProductToDelete(product);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      await refetch();
      toast.success(`Product ${productToDelete.title} deleted successfully`);
      setIsConfirmationOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const handleModalSubmit = async (formData: any) => {
    // This function is no longer needed as EditProductModal handles its own submission
    await refetch();
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (product: AdminProduct) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={product.image_url || getPlaceholderImage('product')}
            alt={product.title || 'Product image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderImage('product');
            }}
          />
        </div>
      ),
    },
    { key: 'title', label: 'Product Title', sortable: true },
    {
      key: 'apparel_type_name',
      label: 'Apparel Type',
      render: (product: AdminProduct) => product.apparel_type_name || 'No Type',
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (product: AdminProduct) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (product: AdminProduct) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          product.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (product: AdminProduct) => new Date(product.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: AdminProduct) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(product)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <button
            onClick={handleCreateProduct}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Enhanced Filter Bar */}
        <FilterBar
          searchValue={params.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder="Search products by title or description..."
          filters={filterConfigs}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultCount={products.total}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Products Table */}
      <DataTable
        data={products}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Modal */}
        <EditProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          mode={modalMode}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => {
            setIsConfirmationOpen(false);
            setProductToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default ProductsTab;