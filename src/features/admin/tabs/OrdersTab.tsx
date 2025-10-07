@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { CreditCard as Edit, Eye, Calendar, DollarSign, CreditCard } from 'lucide-react';
 import DataTable from '../components/DataTable';
 import FilterBar, { FilterConfig } from '../components/FilterBar';
 import EditOrderModal from '../components/EditOrderModal';
 import { updateOrder, getSalesReps, getDesigners } from '../api/supabaseHelpers';
-import { AdminOrder, AdminUser, PaginationParams } from '../types';
+import { AdminOrder, AdminUser, PaginationParams } from '../../../types';
 import { usePaginatedData } from '../hooks/useAdminData';
 import { getOrders } from '../api/supabaseHelpers';

export default EditOrderModal