@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { X, Calendar, User, FileText, DollarSign, Package, Eye } from 'lucide-react';
 import { getInvoiceById, getOrdersByIds } from '../api/supabaseHelpers';
-import { Invoice, AdminOrder } from '../types';
+import { Invoice, AdminOrder } from '../../../types';

export default React