import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/corsHeaders.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!employee || employee.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const stockDesignId = url.searchParams.get('stockDesignId');
    const action = url.searchParams.get('action');

    if (action === 'upload' && req.method === 'POST') {
      if (!stockDesignId) {
        return new Response(
          JSON.stringify({ error: 'Stock design ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (!file.name.toLowerCase().endsWith('.zip')) {
        return new Response(
          JSON.stringify({ error: 'Only ZIP files are allowed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        return new Response(
          JSON.stringify({ error: 'File size exceeds 100MB limit' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${stockDesignId}.${fileExt}`;
      const filePath = `stock-designs/${fileName}`;

      const fileBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('stock-design-files')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to upload file' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: updateError } = await supabase
        .from('stock_designs')
        .update({
          attachment_url: filePath,
          attachment_filename: file.name,
          attachment_size: file.size,
        })
        .eq('id', stockDesignId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update stock design' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          filePath,
          fileName: file.name,
          fileSize: file.size,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'delete' && req.method === 'DELETE') {
      if (!stockDesignId) {
        return new Response(
          JSON.stringify({ error: 'Stock design ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: stockDesign } = await supabase
        .from('stock_designs')
        .select('attachment_url')
        .eq('id', stockDesignId)
        .single();

      if (stockDesign?.attachment_url) {
        await supabase.storage
          .from('stock-design-files')
          .remove([stockDesign.attachment_url]);
      }

      await supabase
        .from('stock_designs')
        .update({
          attachment_url: null,
          attachment_filename: null,
          attachment_size: null,
        })
        .eq('id', stockDesignId);

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
