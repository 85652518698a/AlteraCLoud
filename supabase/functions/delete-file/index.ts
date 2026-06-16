import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Missing token', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return new Response('Invalid token format', { status: 401 });
    }
    
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
      )
    );
    const email = payload?.email?.toLowerCase()?.trim();

    if (!email) {
      return new Response('Unauthorized: Invalid token', { status: 403 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Check admin status from DB
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (adminError || !adminUser) {
      return new Response('Unauthorized: Admin access required', { status: 403 });
    }

    const { fileId } = await req.json();
    if (!fileId) return new Response('Missing fileId', { status: 400 });

    const { data: file, error: fetchError } = await supabaseAdmin
      .from('files')
      .select('storage_path, name')
      .eq('id', fileId)
      .single();

    if (fetchError || !file) throw new Error('File not found');

    const { error: storageError } = await supabaseAdmin.storage
      .from('altera-resources')
      .remove([file.storage_path]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;

    await supabaseAdmin.from('audit_logs').insert({
      action: 'delete',
      file_id: fileId,
      file_name: file.name,
      performed_by: email,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
