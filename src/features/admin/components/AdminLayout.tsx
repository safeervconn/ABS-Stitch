@@ .. @@
+/**
+ * Admin Layout Component
+ * 
+ * Main layout wrapper for admin interface providing:
+ * - Navigation header with user info and actions
+ * - Tab-based navigation system
+ * - Notification integration
+ * - Role-based access control
+ * - Responsive design with mobile support
+ */
+
 import React, { useState, useEffect } from 'react';
 import { Users, ShoppingBag, Package, BarChart3, Bell, LogOut, FileText, CircleUser as UserCircle, Home } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../../components/NotificationDropdown';
import { signOut, getCurrentUser, getUserProfile } from '../../../core/api/supabase';
+import NotificationDropdown from '../../notifications/NotificationDropdown';
+import { signOut, getCurrentUser, getUserProfile } from '../../../core/api/supabase';