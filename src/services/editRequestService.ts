import { supabase } from '../lib/supabase';

export interface EditRequest {
  id: string;
  order_id: string;
  customer_id: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  designer_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface CreateEditRequestData {
  order_id: string;
  description: string;
}

export interface UpdateEditRequestData {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  designer_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
}

export const editRequestService = {
  async createEditRequest(data: CreateEditRequestData): Promise<EditRequest> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('status, edits')
      .eq('id', data.order_id)
      .maybeSingle();

    if (orderFetchError) {
      throw new Error('Failed to fetch order details');
    }

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'completed') {
      throw new Error('Edit requests are only allowed for completed orders');
    }

    const { data: editRequest, error: insertError } = await supabase
      .from('edit_requests')
      .insert({
        order_id: data.order_id,
        customer_id: user.id,
        description: data.description,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const currentEdits = order.edits || 0;
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'new',
        edits: currentEdits + 1
      })
      .eq('id', data.order_id);

    if (updateError) {
      console.error('Error updating order status and edits:', updateError);
      throw new Error('Failed to update order status');
    }

    const { error: commentError } = await supabase
      .from('edit_comments')
      .insert({
        edit_request_id: editRequest.id,
        author_id: user.id,
        content: data.description
      });

    if (commentError) {
      console.error('Error creating edit comment:', commentError);
    }

    return editRequest;
  },

  async getEditRequestsByOrder(orderId: string): Promise<EditRequest[]> {
    const { data, error } = await supabase
      .from('edit_requests')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getEditRequestsByCustomer(customerId: string): Promise<EditRequest[]> {
    const { data, error } = await supabase
      .from('edit_requests')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllPendingEditRequests(): Promise<EditRequest[]> {
    const { data, error } = await supabase
      .from('edit_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateEditRequest(id: string, updates: UpdateEditRequestData): Promise<EditRequest> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = { ...updates };

    if (updates.status && updates.status !== 'pending') {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user.id;
    }

    const { data, error } = await supabase
      .from('edit_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEditRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('edit_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
