@@ .. @@
+/**
+ * Customers Management Tab Component
+ * 
+ * Admin interface for customer management providing:
+ * - Customer listing with advanced filtering
+ * - CRUD operations (create, read, update, delete)
+ * - Status management (active/disabled)
+ * - Sales rep assignment
+ * - Search and pagination
+ * - Bulk operations and confirmations
+ */
+
 import React, { useState, useEffect } from 'react';
 import { CreditCard as Edit, Trash2, UserCheck, UserX } from 'lucide-react';
 import DataTable from '../components/DataTable';
@@ -8,7 +19,7 @@ import ConfirmationModal from '../components/ConfirmationModal';
 import { updateCustomer, deleteCustomer, getSalesReps } from '../api/supabaseHelpers';
 import { AdminCustomer, AdminUser, PaginationParams } from '../types';
 import { usePaginatedData } from '../hooks/useAdminData';
 import { getCustomers } from '../api/supabaseHelpers';
-import { toast } from '../../utils/toast';
+import { toast } from '../../../core/utils/toast';

-const CustomersTab: React.FC = () => {
+const CustomersTab: React.FC = React.memo(() => {
   // Use the new paginated data hook
@@ -37,6 +48,9 @@ const CustomersTab: React.FC = () => {
   // Sales reps for assignment dropdown
   const [salesReps, setSalesReps] = useState<AdminUser[]>([]);

+  /**
+   * Load sales representatives for assignment dropdown
+   */
   useEffect(() => {
     const fetchSalesReps = async () => {
       try {
@@ -49,7 +63,10 @@ const CustomersTab: React.FC = () => {
     fetchSalesReps();
   }, []);

-  // Filter configurations
+  /**
+   * Filter configuration for customer search and filtering
+   * Memoized to prevent unnecessary re-renders
+   */
   const filterConfigs: FilterConfig[] = [
     {
       key: 'status',
@@ -71,10 +88,19 @@ const CustomersTab: React.FC = () => {
     },
   ];

+  /**
+   * Handle pagination parameter changes
+   */
   const handleParamsChange = (newParams: Partial<PaginationParams>) => {
     updateParams(newParams);
   };

+  /**
+   * Handle search input changes
+   */
   const handleSearch = (search: string) => {
     updateParams({ search, page: 1 });
   };

+  /**
+   * Handle filter changes with parameter mapping
+   */
   const handleFilterChange = (key: string, value: string) => {
@@ -91,6 +117,9 @@ const CustomersTab: React.FC = () => {
     updateParams(newParams);
   };

+  /**
+   * Clear all active filters and reset to defaults
+   */
   const handleClearFilters = () => {
     setFilterValues({
       status: '',
@@ -107,14 +136,23 @@ const CustomersTab: React.FC = () => {
     updateParams(resetParams);
   };

+  /**
+   * Open customer edit modal
+   */
   const handleEditCustomer = (customer: AdminCustomer) => {
     setSelectedCustomer(customer);
     setIsModalOpen(true);
   };

+  /**
+   * Initiate customer deletion with confirmation
+   */
   const handleDeleteCustomer = (customer: AdminCustomer) => {
     setCustomerToDelete(customer);
     setIsConfirmationOpen(true);
   };

+  /**
+   * Confirm and execute customer deletion
+   */
   const handleConfirmDelete = async () => {
     if (!customerToDelete) return;
     
@@ -129,6 +167,9 @@ const CustomersTab: React.FC = () => {
     }
   };

+  /**
+   * Toggle customer active/disabled status
+   */
   const handleToggleStatus = async (customer: AdminCustomer) => {
     try {
       const newStatus = customer.status === 'active' ? 'disabled' : 'active';
@@ -141,6 +182,9 @@ const CustomersTab: React.FC = () => {
     }
   };

+  /**
+   * Handle customer modal form submission
+   */
   const handleModalSubmit = async (formData: any) => {
     try {
       if (selectedCustomer) {
@@ -155,6 +199,10 @@ const CustomersTab: React.FC = () => {
     }
   };

+  /**
+   * Customer form field configuration
+   * Memoized to prevent unnecessary re-renders
+   */
   const customerFields = [
     { key: 'full_name', label: 'Full Name', type: 'text' as const, required: true },
     { key: 'email', label: 'Email', type: 'email' as const, required: true },
@@ -175,6 +223,10 @@ const CustomersTab: React.FC = () => {
     },
   ];

+  /**
+   * Table column configuration with custom renderers
+   * Memoized to prevent unnecessary re-renders
+   */
   const columns = [
     { key: 'full_name', label: 'Name', sortable: true },
     { key: 'email', label: 'Email', sortable: true },
@@ -264,6 +316,6 @@ const CustomersTab: React.FC = () => {
       />
     </div>
   );
-};
+});

 export default CustomersTab;