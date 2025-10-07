@@ .. @@
 import React, { useState } from 'react';
 import { Plus, FileText, Eye, CreditCard as Edit, Calendar, DollarSign } from 'lucide-react';
 import DataTable from '../components/DataTable';
 import FilterBar, { FilterConfig } from '../components/FilterBar';
 import GenerateInvoiceModal from '../components/GenerateInvoiceModal';
 import InvoiceDetailsModal from '../components/InvoiceDetailsModal';
 import EditInvoiceModal from '../components/EditInvoiceModal';
 import { getInvoices, getCustomersForInvoice } from '../api/supabaseHelpers';
-import { Invoice, PaginationParams } from '../types';
+import { Invoice, PaginationParams } from '../../../types';
 import { usePaginatedData } from '../hooks/useAdminData';