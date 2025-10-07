@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { Users, ShoppingBag, Package, BarChart3, Bell, LogOut, FileText, CircleUser as UserCircle, Home, User } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
-import NotificationDropdown from '../../components/NotificationDropdown';
import { signOut, getCurrentUser } from '../../../api/auth';
import { getUserProfile } from '../../../api/users';
+import NotificationDropdown from '../../../components/NotificationDropdown';
+import { signOut, getCurrentUser, getUserProfile } from '../../../core/api/supabase';