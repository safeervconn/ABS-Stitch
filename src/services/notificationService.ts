import { supabase } from '../lib/supabase';

export type NotificationType = 'order' | 'user' | 'stockdesign' | 'system';

export interface NotificationTemplate {
  type: NotificationType;
  message: string;
}

export async function getAllAdmins(): Promise<Array<{ id: string; full_name: string }>> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name')
      .eq('role', 'admin')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        message,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function createBatchNotifications(
  notifications: Array<{ userId: string; type: NotificationType; message: string }>
): Promise<void> {
  if (notifications.length === 0) return;

  if (notifications.every(n => n.type === notifications[0].type && n.message === notifications[0].message)) {
    try {
      const userIds = notifications.map(n => n.userId);
      const { error } = await supabase.rpc('create_notification_batch', {
        user_ids: userIds,
        notification_type: notifications[0].type,
        notification_message: notifications[0].message
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating batch notifications via RPC:', error);
    }
  } else {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(
          notifications.map(n => ({
            user_id: n.userId,
            type: n.type,
            message: n.message,
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error creating batch notifications:', error);
    }
  }
}

export async function notifyAdminsAboutNewCustomer(
  customerName: string
): Promise<void> {
  try {
    const admins = await getAllAdmins();
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'user' as NotificationType,
      message: `New customer ${customerName} has signed up`,
    }));
    await createBatchNotifications(notifications);
  } catch (error) {
    console.error('Error notifying admins about new customer:', error);
  }
}

export async function notifyAdminsAboutNewEmployee(
  employeeName: string,
  role: string
): Promise<void> {
  try {
    const admins = await getAllAdmins();
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'user' as NotificationType,
      message: `New employee ${employeeName} has signed up (${role.replace('_', ' ')}) - pending approval`,
    }));
    await createBatchNotifications(notifications);
  } catch (error) {
    console.error('Error notifying admins about new employee:', error);
  }
}

export async function notifyAboutNewOrder(
  customerId: string,
  customerName: string,
  orderNumber: string,
  orderType: string,
  salesRepId?: string
): Promise<void> {
  try {
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [
      {
        userId: customerId,
        type: 'order',
        message: `Your ${orderType} order ${orderNumber} has been placed successfully!`,
      },
    ];

    const admins = await getAllAdmins();
    admins.forEach(admin => {
      notifications.push({
        userId: admin.id,
        type: 'order',
        message: `New ${orderType} order ${orderNumber} has been placed by ${customerName}`,
      });
    });

    if (salesRepId) {
      notifications.push({
        userId: salesRepId,
        type: 'order',
        message: `New ${orderType} order ${orderNumber} has been placed by your assigned customer ${customerName}`,
      });
    }

    await createBatchNotifications(notifications);
  } catch (error) {
    console.error('Error notifying about new order:', error);
  }
}

export async function notifyAboutOrderStatusChange(
  orderId: string,
  orderNumber: string,
  newStatus: string,
  customerId: string,
  salesRepId?: string,
  designerId?: string
): Promise<void> {
  try {
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [];

    if (newStatus === 'under_review' && salesRepId) {
      notifications.push({
        userId: salesRepId,
        type: 'order',
        message: `Order ${orderNumber} is now under review. Please check it.`,
      });
    }

    if (newStatus === 'completed') {
      notifications.push({
        userId: customerId,
        type: 'order',
        message: `Your order ${orderNumber} has been completed!`,
      });
    }

    if (notifications.length > 0) {
      await createBatchNotifications(notifications);
    }
  } catch (error) {
    console.error('Error notifying about order status change:', error);
  }
}

export async function notifyDesignerAboutAssignment(
  designerId: string,
  orderNumber: string
): Promise<void> {
  try {
    await createNotification(
      designerId,
      'order',
      `Order ${orderNumber} has been assigned to you.`
    );
  } catch (error) {
    console.error('Error notifying designer about assignment:', error);
  }
}

export async function notifyCustomerAboutInvoice(
  customerId: string,
  invoiceTitle: string
): Promise<void> {
  try {
    await createNotification(
      customerId,
      'order',
      `A new invoice "${invoiceTitle}" has been generated for you. Please check your invoices section.`
    );
  } catch (error) {
    console.error('Error notifying customer about invoice:', error);
  }
}
