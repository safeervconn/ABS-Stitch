@@ .. @@
 import React, { useState } from 'react';
 import { ShoppingBag, Plus, Eye, Search, Calendar, Package } from 'lucide-react';
-import { useOrders } from '../../contexts/OrderContext';
-import OrderDetailsModal from '../../components/OrderDetailsModal';
-import PlaceOrderModal from '../../components/PlaceOrderModal';
+import { useOrders } from '../../orders/OrderContext';
+import OrderDetailsModal from '../../../components/OrderDetailsModal';
+import PlaceOrderModal from '../../../components/PlaceOrderModal';