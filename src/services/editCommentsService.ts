import { supabase } from '../lib/supabase';
import { EditComment } from '../admin/types';

export interface CreateEditCommentData {
  edit_request_id: string;
  content: string;
}

export const editCommentsService = {
  async getEditCommentsByOrder(orderId: string): Promise<EditComment[]> {
    const { data, error } = await supabase
      .from('edit_comments')
      .select(`
        id,
        edit_request_id,
        author_id,
        content,
        created_at
      `)
      .eq('edit_request_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching edit comments:', error);
      throw error;
    }

    const commentsWithAuthors = await Promise.all(
      (data || []).map(async (comment) => {
        try {
          const { data: userData } = await supabase
            .from('customers')
            .select('full_name')
            .eq('id', comment.author_id)
            .maybeSingle();

          if (userData) {
            return {
              ...comment,
              author_name: userData.full_name
            };
          }

          const { data: employeeData } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', comment.author_id)
            .maybeSingle();

          return {
            ...comment,
            author_name: employeeData?.full_name || 'Unknown User'
          };
        } catch (err) {
          console.error('Error fetching author name:', err);
          return {
            ...comment,
            author_name: 'Unknown User'
          };
        }
      })
    );

    return commentsWithAuthors;
  },

  async getEditCommentsByRequest(editRequestId: string): Promise<EditComment[]> {
    const { data, error } = await supabase
      .from('edit_comments')
      .select(`
        id,
        edit_request_id,
        author_id,
        content,
        created_at
      `)
      .eq('edit_request_id', editRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching edit comments:', error);
      throw error;
    }

    const commentsWithAuthors = await Promise.all(
      (data || []).map(async (comment) => {
        try {
          const { data: userData } = await supabase
            .from('customers')
            .select('full_name')
            .eq('id', comment.author_id)
            .maybeSingle();

          if (userData) {
            return {
              ...comment,
              author_name: userData.full_name
            };
          }

          const { data: employeeData } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', comment.author_id)
            .maybeSingle();

          return {
            ...comment,
            author_name: employeeData?.full_name || 'Unknown User'
          };
        } catch (err) {
          console.error('Error fetching author name:', err);
          return {
            ...comment,
            author_name: 'Unknown User'
          };
        }
      })
    );

    return commentsWithAuthors;
  },

  async createEditComment(data: CreateEditCommentData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('edit_comments')
      .insert({
        edit_request_id: data.edit_request_id,
        author_id: user.id,
        content: data.content
      });

    if (error) {
      console.error('Error creating edit comment:', error);
      throw error;
    }
  }
};
