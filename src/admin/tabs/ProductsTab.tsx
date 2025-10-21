import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Eye, Package } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import EditStockDesignModal from '../components/EditStockDesignModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { createStockDesign, updateStockDesign, deleteStockDesign, getCategories } from '../api/supabaseHelpers';
import { AdminStockDesign, Category, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';
import { getStockDesigns } from '../api/supabaseHelpers';
import { toast } from '../../utils/toast';
import { getPlaceholderImage } from '../../lib/placeholderImages';
import { CSVColumn } from '../../shared/utils/csvExport';

const StockDesignsTab: React.FC = () => {
  // Use the new paginated data hook
  const { data: stockDesigns, params, loading, error, updateParams, refetch } = usePaginatedData(
    getStockDesigns,
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
    category: '',
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
  const [selectedStockDesign, setSelectedStockDesign] = useState<AdminStockDesign | null>(null);

  // Confirmation modal states
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [stockDesignToDelete, setStockDesignToDelete] = useState<AdminStockDesign | null>(null);
  
  // Categories for dropdown
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      options: categories.map(cat => ({ value: cat.id, label: cat.category_name })),
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
    
    if (key === 'category' && value) {
      newParams.categoryId = value;
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
      category: '',
      status: '',
      priceMin: '',
      priceMax: '',
    });
    const resetParams: PaginationParams = {
      ...initialParams,
      categoryId: undefined,
      status: undefined,
      priceMin: undefined,
      priceMax: undefined,
    };
    updateParams(resetParams);
  };

  const handleCreateStockDesign = () => {
    setModalMode('create');
    setSelectedStockDesign(null);
    setIsModalOpen(true);
  };

  const handleEditStockDesign = (stockDesign: AdminStockDesign) => {
    setModalMode('edit');
    setSelectedStockDesign(stockDesign);
    setIsModalOpen(true);
  };

  const handleDeleteStockDesign = (stockDesign: AdminStockDesign) => {
    setStockDesignToDelete(stockDesign);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!stockDesignToDelete) return;

    try {
      await deleteStockDesign(stockDesignToDelete.id);
      await refetch();
      toast.success(`Stock Design ${stockDesignToDelete.title} deleted successfully`);
      setIsConfirmationOpen(false);
      setStockDesignToDelete(null);
    } catch (error) {
      console.error('Error deleting Stock Design:', error);
      toast.error('Failed to delete Stock Design. Please try again.');
    }
  };

  const handleModalSubmit = async (formData: any) => {
    // This function is no longer needed as EditStockDesignModal handles its own submission
    await refetch();
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (stockDesign: AdminStockDesign) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={stockDesign.image_url || getPlaceholderImage('stock_design')}
            alt={stockDesign.title || 'Stock Design image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderImage('stock_design');
            }}
          />
        </div>
      ),
    },
    { key: 'title', label: 'Stock Design Title', sortable: true },
    {
      key: 'category_name',
      label: 'Category',
      render: (stockDesign: AdminStockDesign) => stockDesign.category_name || 'No Category',
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (stockDesign: AdminStockDesign) => `$${stockDesign.price.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (stockDesign: AdminStockDesign) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          stockDesign.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {stockDesign.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (stockDesign: AdminStockDesign) => new Date(stockDesign.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (stockDesign: AdminStockDesign) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditStockDesign(stockDesign)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit Stock Design"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteStockDesign(stockDesign)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete Stock Design"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const csvColumns: CSVColumn<AdminStockDesign>[] = [
    { key: 'title', label: 'Stock Design Title' },
    { key: 'category_name', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      format: (stockDesign) => stockDesign.price.toFixed(2)
    },
    { key: 'status', label: 'Status' },
    {
      key: 'created_at',
      label: 'Created Date',
      format: (stockDesign) => new Date(stockDesign.created_at).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Stock Design Management</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your Stock Design Catalog</p>
          </div>
          <button
            onClick={handleCreateStockDesign}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stock Design</span>
          </button>
        </div>

        {/* Enhanced Filter Bar */}
        <FilterBar
          searchValue={params.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder="Search Stock Designs by title or description..."
          filters={filterConfigs}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultCount={stockDesigns.total}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        )}

        {/* Stock Design Table */}
        <DataTable
        data={stockDesigns}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
        csvFilename="stock_designs_filtered"
        csvColumns={csvColumns}
      />


        {/* Stock Design Modal */}
        <EditStockDesignModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          stockDesign={selectedStockDesign}
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
            setStockDesignToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Stock Design"
          message={`Are you sure you want to delete "${stockDesignToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default StockDesignsTab;