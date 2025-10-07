@@ .. @@
+/**
+ * Edit Order Modal Component
+ * 
+ * Comprehensive order editing interface providing:
+ * - Order details modification (status, assignments, specifications)
+ * - File upload and management
+ * - Order comments system
+ * - Role-based field restrictions
+ * - Real-time validation and error handling
+ */
+
 import React, { useState, useEffect } from 'react';
 import { X, Save, Loader, Paperclip, Trash2, Upload, Download, MessageSquare, Send } from 'lucide-react';
 import { updateOrder, getSalesReps, getDesigners, getOrderComments, addOrderComment, getApparelTypes } from '../api/supabaseHelpers';
 import { AdminOrder, AdminUser } from '../types';
-import { supabase, getCurrentUser, getUserProfile } from '../../lib/supabase';
-import { toast } from '../../utils/toast';
+import { supabase, getCurrentUser, getUserProfile } from '../../../core/api/supabase';
+import { toast } from '../../../core/utils/toast';

export default React