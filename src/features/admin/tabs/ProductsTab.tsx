@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { Plus, CreditCard as Edit, Trash2, Eye, Package } from 'lucide-react';
 import DataTable from '../components/DataTable';
 import FilterBar, { FilterConfig } from '../components/FilterBar';
 import EditProductModal from '../components/EditProductModal';
 import ConfirmationModal from '../components/ConfirmationModal';
 import { createProduct, updateProduct, deleteProduct, getApparelTypes } from '../api/supabaseHelpers';
-import { AdminProduct, ApparelType, PaginationParams } from '../types';
+import { AdminProduct, ApparelType, PaginationParams } from '../../../types';
 import { usePaginatedData } from '../hooks/useAdminData';
 import { getProducts } from '../api/supabaseHelpers';
-import { toast } from '../../utils/toast';
+import { toast } from '../../../core/utils/toast';

export default ConfirmationModal