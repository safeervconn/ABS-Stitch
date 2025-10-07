@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { X, Save, Loader, Upload, Trash2, Eye, Package } from 'lucide-react';
import { createProduct, updateProduct, getApparelTypes } from '../api/supabaseHelpers';
import { deleteFileFromStorage } from '../../../api/orders';
-import { AdminProduct, ApparelType } from '../types';
import { supabase } from '../../../api/client';
import { toast } from '../../../utils/toast';
+import { AdminProduct, ApparelType } from '../../../types';
+import { supabase } from '../../../core/api/supabase';
+import { toast } from '../../../core/utils/toast';

export default React