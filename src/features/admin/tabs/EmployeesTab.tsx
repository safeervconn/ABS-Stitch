@@ .. @@
 import React, { useState } from 'react';
 import { Copy, CreditCard as Edit, Trash2, UserCheck, UserX } from 'lucide-react';
 import DataTable from '../components/DataTable';
 import FilterBar, { FilterConfig } from '../components/FilterBar';
 import { updateUser, deleteUser } from '../api/supabaseHelpers';
-import { AdminUser, PaginationParams } from '../types';
+import { AdminUser, PaginationParams } from '../../../types';
 import { usePaginatedData } from '../hooks/useAdminData';
import { toast } from '../../../utils/toast';
-import { toast } from '../../utils/toast';
+import { toast } from '../../../core/utils/toast';

export default FilterBar