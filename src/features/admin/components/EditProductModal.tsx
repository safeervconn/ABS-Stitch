@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { X, Save, Loader, Upload, Trash2, Eye, Package } from 'lucide-react';
 import { createProduct, updateProduct, getApparelTypes, deleteFileFromStorage } from '../api/supabaseHelpers';
-import { AdminProduct, ApparelType } from '../types';
-import { supabase } from '../../lib/supabase';
-import { toast } from '../../utils/toast';
+import { AdminProduct, ApparelType } from '../../../types';
+import { supabase } from '../../../core/api/supabase';
+import { toast } from '../../../core/utils/toast';