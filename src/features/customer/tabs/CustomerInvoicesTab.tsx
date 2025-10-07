@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { FileText, Download, Eye, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '../../../api/client';
import { getCurrentUser } from '../../../api/auth';
-import InvoiceDetailsModal from '../../admin/components/InvoiceDetailsModal';
-import { Invoice } from '../../admin/types';
+import { supabase, getCurrentUser } from '../../../core/api/supabase';
+import InvoiceDetailsModal from '../components/InvoiceDetailsModal';
+import { Invoice } from '../../../types';