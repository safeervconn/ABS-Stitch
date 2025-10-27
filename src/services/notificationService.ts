import { supabase } from '../lib/supabase';

export type NotificationType = 'order' | 'user' | 'stock_design' | 'invoice';

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
    const notificationType: NotificationType = orderType === 'stock_design' ? 'stock_design' : 'order';
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [];

    if (orderType === 'stock_design') {
      notifications.push({
        userId: customerId,
        type: notificationType,
        message: `Your stock design order ${orderNumber} has been placed successfully!`,
      });

      const admins = await getAllAdmins();
      admins.forEach(admin => {
        notifications.push({
          userId: admin.id,
          type: notificationType,
          message: `New stock design order ${orderNumber} has been placed by ${customerName}`,
        });
      });
    } else {
      notifications.push({
        userId: customerId,
        type: notificationType,
        message: `Your custom order ${orderNumber} has been placed successfully!`,
      });

      const admins = await getAllAdmins();
      admins.forEach(admin => {
        notifications.push({
          userId: admin.id,
          type: notificationType,
          message: `New custom order ${orderNumber} has been placed by ${customerName}`,
        });
      });

      if (salesRepId) {
        notifications.push({
          userId: salesRepId,
          type: notificationType,
          message: `New custom order ${orderNumber} has been placed by your assigned customer ${customerName}`,
        });
      }
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
  orderType: 'custom' | 'stock_design',
  salesRepId?: string,
  designerId?: string
): Promise<void> {
  try {
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [];
    const notificationType: NotificationType = orderType === 'stock_design' ? 'stock_design' : 'order';

    if (newStatus === 'under_review' && orderType === 'custom' && salesRepId) {
      notifications.push({
        userId: salesRepId,
        type: notificationType,
        message: `Custom order ${orderNumber} is now under review and requires your attention.`,
      });
    }

    if (newStatus === 'completed') {
      notifications.push({
        userId: customerId,
        type: notificationType,
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

export async function notifyAboutInvoiceCreation(
  customerId: string,
  invoiceTitle: string
): Promise<void> {
  try {
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [];

    notifications.push({
      userId: customerId,
      type: 'invoice',
      message: `A new invoice "${invoiceTitle}" has been generated for you.`,
    });

    const admins = await getAllAdmins();
    admins.forEach(admin => {
      notifications.push({
        userId: admin.id,
        type: 'invoice',
        message: `New invoice "${invoiceTitle}" has been created.`,
      });
    });

    await createBatchNotifications(notifications);
  } catch (error) {
    console.error('Error notifying about invoice creation:', error);
  }
}

export async function notifyAboutEditRequest(
  customerId: string,
  orderNumber: string,
  orderName: string,
  orderType: 'custom' | 'stock_design',
  salesRepId?: string
): Promise<void> {
  try {
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [];
    const notificationType: NotificationType = orderType === 'stock_design' ? 'stock_design' : 'order';

    notifications.push({
      userId: customerId,
      type: notificationType,
      message: `Your edit request for order ${orderName || orderNumber} has been submitted successfully.`,
    });

    const admins = await getAllAdmins();
    admins.forEach(admin => {
      notifications.push({
        userId: admin.id,
        type: notificationType,
        message: `New edit request received for order ${orderName || orderNumber}.`,
      });
    });

    if (orderType === 'custom' && salesRepId) {
      notifications.push({
        userId: salesRepId,
        type: notificationType,
        message: `Edit request received for order ${orderName || orderNumber}.`,
      });
    }

    if (notifications.length > 0) {
      await createBatchNotifications(notifications);
    }
  } catch (error) {
    console.error('Error notifying about edit request:', error);
  }
}

export async function notifySalesRepAboutAssignment(
  salesRepId: string,
  customerName: string
): Promise<void> {
  try {
    await createNotification(
      salesRepId,
      'user',
      `You have been assigned to customer ${customerName}.`
    );
  } catch (error) {
    console.error('Error notifying sales rep about customer assignment:', error);
  }
}

export async function notifyAboutInvoiceStatusChange(
  customerId: string,
  invoiceTitle: string,
  newStatus: 'paid' | 'cancelled'
): Promise<void> {
  try {
    const notifications: Array<{ userId: string; type: NotificationType; message: string }> = [];

    const customerMessage = newStatus === 'paid'
      ? `Your invoice "${invoiceTitle}" has been marked as paid. Thank you!`
      : `Your invoice "${invoiceTitle}" has been cancelled.`;

    notifications.push({
      userId: customerId,
      type: 'invoice',
      message: customerMessage,
    });

    const admins = await getAllAdmins();
    const adminMessage = newStatus === 'paid'
      ? `Invoice "${invoiceTitle}" has been marked as paid.`
      : `Invoice "${invoiceTitle}" has been cancelled.`;

    admins.forEach(admin => {
      notifications.push({
        userId: admin.id,
        type: 'invoice',
        message: adminMessage,
      });
    });

    await createBatchNotifications(notifications);
  } catch (error) {
    console.error('Error notifying about invoice status change:', error);
  }
}
