import { supabase } from '../lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type TableName = 'orders' | 'notifications' | 'customers' | 'employees' | 'stock_designs' | 'invoices' | 'order_comments';
export type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscriptionOptions {
  table: TableName;
  event?: ChangeType | '*';
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribe(id: string, options: RealtimeSubscriptionOptions): RealtimeChannel {
    if (this.channels.has(id)) {
      return this.channels.get(id)!;
    }

    let channel = supabase.channel(id);

    const event = options.event || '*';
    const config: any = {
      event,
      schema: 'public',
      table: options.table,
    };

    if (options.filter) {
      config.filter = options.filter;
    }

    channel = channel.on('postgres_changes', config, (payload: RealtimePostgresChangesPayload<any>) => {
      if (options.onChange) {
        options.onChange(payload);
      }

      switch (payload.eventType) {
        case 'INSERT':
          if (options.onInsert) options.onInsert(payload);
          break;
        case 'UPDATE':
          if (options.onUpdate) options.onUpdate(payload);
          break;
        case 'DELETE':
          if (options.onDelete) options.onDelete(payload);
          break;
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${options.table} changes`);
      }
    });

    this.channels.set(id, channel);
    return channel;
  }

  unsubscribe(id: string): void {
    const channel = this.channels.get(id);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(id);
      console.log(`Unsubscribed from channel: ${id}`);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel, id) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from channel: ${id}`);
    });
    this.channels.clear();
  }

  getChannel(id: string): RealtimeChannel | undefined {
    return this.channels.get(id);
  }

  isSubscribed(id: string): boolean {
    return this.channels.has(id);
  }
}

export const realtimeManager = new RealtimeSubscriptionManager();

export function subscribeToOrders(
  userId: string,
  callbacks: {
    onInsert?: (order: any) => void;
    onUpdate?: (order: any) => void;
    onDelete?: (order: any) => void;
  }
): RealtimeChannel {
  return realtimeManager.subscribe(`orders-${userId}`, {
    table: 'orders',
    onInsert: (payload) => callbacks.onInsert?.(payload.new),
    onUpdate: (payload) => callbacks.onUpdate?.(payload.new),
    onDelete: (payload) => callbacks.onDelete?.(payload.old),
  });
}

export function subscribeToNotifications(
  userId: string,
  callbacks: {
    onInsert?: (notification: any) => void;
    onUpdate?: (notification: any) => void;
  }
): RealtimeChannel {
  return realtimeManager.subscribe(`notifications-${userId}`, {
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    onInsert: (payload) => callbacks.onInsert?.(payload.new),
    onUpdate: (payload) => callbacks.onUpdate?.(payload.new),
  });
}

export function subscribeToOrderComments(
  orderId: string,
  callbacks: {
    onInsert?: (comment: any) => void;
    onUpdate?: (comment: any) => void;
    onDelete?: (comment: any) => void;
  }
): RealtimeChannel {
  return realtimeManager.subscribe(`order-comments-${orderId}`, {
    table: 'order_comments',
    filter: `order_id=eq.${orderId}`,
    onInsert: (payload) => callbacks.onInsert?.(payload.new),
    onUpdate: (payload) => callbacks.onUpdate?.(payload.new),
    onDelete: (payload) => callbacks.onDelete?.(payload.old),
  });
}

export function subscribeToCustomers(
  callbacks: {
    onInsert?: (customer: any) => void;
    onUpdate?: (customer: any) => void;
    onDelete?: (customer: any) => void;
  }
): RealtimeChannel {
  return realtimeManager.subscribe('customers-all', {
    table: 'customers',
    onInsert: (payload) => callbacks.onInsert?.(payload.new),
    onUpdate: (payload) => callbacks.onUpdate?.(payload.new),
    onDelete: (payload) => callbacks.onDelete?.(payload.old),
  });
}

export function subscribeToStockDesigns(
  callbacks: {
    onInsert?: (stockDesign: any) => void;
    onUpdate?: (stockDesign: any) => void;
    onDelete?: (stockDesign: any) => void;
  }
): RealtimeChannel {
  return realtimeManager.subscribe('stock-designs-all', {
    table: 'stock_designs',
    onInsert: (payload) => callbacks.onInsert?.(payload.new),
    onUpdate: (payload) => callbacks.onUpdate?.(payload.new),
    onDelete: (payload) => callbacks.onDelete?.(payload.old),
  });
}

export function unsubscribeFromOrders(userId: string): void {
  realtimeManager.unsubscribe(`orders-${userId}`);
}

export function unsubscribeFromNotifications(userId: string): void {
  realtimeManager.unsubscribe(`notifications-${userId}`);
}

export function unsubscribeFromOrderComments(orderId: string): void {
  realtimeManager.unsubscribe(`order-comments-${orderId}`);
}

export function unsubscribeFromCustomers(): void {
  realtimeManager.unsubscribe('customers-all');
}

export function unsubscribeFromStockDesigns(): void {
  realtimeManager.unsubscribe('stock-designs-all');
}

export function unsubscribeAll(): void {
  realtimeManager.unsubscribeAll();
}
