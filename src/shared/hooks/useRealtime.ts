import { useEffect, useRef } from 'react';
import {
  subscribeToOrders,
  subscribeToNotifications,
  subscribeToOrderComments,
  subscribeToCustomers,
  subscribeToStockDesigns,
  unsubscribeFromOrders,
  unsubscribeFromNotifications,
  unsubscribeFromOrderComments,
  unsubscribeFromCustomers,
  unsubscribeFromStockDesigns,
} from '../../services/realtimeService';

interface UseOrdersRealtimeOptions {
  userId: string;
  onOrderInsert?: (order: any) => void;
  onOrderUpdate?: (order: any) => void;
  onOrderDelete?: (order: any) => void;
  enabled?: boolean;
}

export function useOrdersRealtime(options: UseOrdersRealtimeOptions) {
  const { userId, onOrderInsert, onOrderUpdate, onOrderDelete, enabled = true } = options;
  const subscriptionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || subscriptionRef.current) return;

    subscribeToOrders(userId, {
      onInsert: onOrderInsert,
      onUpdate: onOrderUpdate,
      onDelete: onOrderDelete,
    });

    subscriptionRef.current = true;

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromOrders(userId);
        subscriptionRef.current = false;
      }
    };
  }, [userId, enabled, onOrderInsert, onOrderUpdate, onOrderDelete]);
}

interface UseNotificationsRealtimeOptions {
  userId: string;
  onNotificationInsert?: (notification: any) => void;
  onNotificationUpdate?: (notification: any) => void;
  enabled?: boolean;
}

export function useNotificationsRealtime(options: UseNotificationsRealtimeOptions) {
  const { userId, onNotificationInsert, onNotificationUpdate, enabled = true } = options;
  const subscriptionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || subscriptionRef.current) return;

    subscribeToNotifications(userId, {
      onInsert: onNotificationInsert,
      onUpdate: onNotificationUpdate,
    });

    subscriptionRef.current = true;

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromNotifications(userId);
        subscriptionRef.current = false;
      }
    };
  }, [userId, enabled, onNotificationInsert, onNotificationUpdate]);
}

interface UseOrderCommentsRealtimeOptions {
  orderId: string;
  onCommentInsert?: (comment: any) => void;
  onCommentUpdate?: (comment: any) => void;
  onCommentDelete?: (comment: any) => void;
  enabled?: boolean;
}

export function useOrderCommentsRealtime(options: UseOrderCommentsRealtimeOptions) {
  const { orderId, onCommentInsert, onCommentUpdate, onCommentDelete, enabled = true } = options;
  const subscriptionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || subscriptionRef.current) return;

    subscribeToOrderComments(orderId, {
      onInsert: onCommentInsert,
      onUpdate: onCommentUpdate,
      onDelete: onCommentDelete,
    });

    subscriptionRef.current = true;

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromOrderComments(orderId);
        subscriptionRef.current = false;
      }
    };
  }, [orderId, enabled, onCommentInsert, onCommentUpdate, onCommentDelete]);
}

interface UseCustomersRealtimeOptions {
  onCustomerInsert?: (customer: any) => void;
  onCustomerUpdate?: (customer: any) => void;
  onCustomerDelete?: (customer: any) => void;
  enabled?: boolean;
}

export function useCustomersRealtime(options: UseCustomersRealtimeOptions) {
  const { onCustomerInsert, onCustomerUpdate, onCustomerDelete, enabled = true } = options;
  const subscriptionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || subscriptionRef.current) return;

    subscribeToCustomers({
      onInsert: onCustomerInsert,
      onUpdate: onCustomerUpdate,
      onDelete: onCustomerDelete,
    });

    subscriptionRef.current = true;

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromCustomers();
        subscriptionRef.current = false;
      }
    };
  }, [enabled, onCustomerInsert, onCustomerUpdate, onCustomerDelete]);
}

interface UseStockDesignsRealtimeOptions {
  onStockDesignInsert?: (stockDesign: any) => void;
  onStockDesignUpdate?: (stockDesign: any) => void;
  onStockDesignDelete?: (stockDesign: any) => void;
  enabled?: boolean;
}

export function useStockDesignsRealtime(options: UseStockDesignsRealtimeOptions) {
  const { onStockDesignInsert, onStockDesignUpdate, onStockDesignDelete, enabled = true } = options;
  const subscriptionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || subscriptionRef.current) return;

    subscribeToStockDesigns({
      onInsert: onStockDesignInsert,
      onUpdate: onStockDesignUpdate,
      onDelete: onStockDesignDelete,
    });

    subscriptionRef.current = true;

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromStockDesigns();
        subscriptionRef.current = false;
      }
    };
  }, [enabled, onStockDesignInsert, onStockDesignUpdate, onStockDesignDelete]);
}
