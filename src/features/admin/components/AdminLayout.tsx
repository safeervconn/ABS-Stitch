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
import { signOut, getCurrentUser } from '../../../api/auth';
import { getUserProfile } from '../../../api/users';
+import NotificationDropdown from '../../notifications/NotificationDropdown';
+import { signOut, getCurrentUser, getUserProfile } from '../../../core/api/supabase';