@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { X, Save, Loader, FileText, Package } from 'lucide-react';
 import { getInvoiceById, getAllCustomerOrders, updateInvoice } from '../api/supabaseHelpers';
-import { Invoice, AdminOrder } from '../types';
+import { Invoice, AdminOrder } from '../../../types';
 import ConfirmationModal from './ConfirmationModal';
-import { toast } from '../../utils/toast';
+import { toast } from '../../../core/utils/toast';