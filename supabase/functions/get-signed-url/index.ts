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
      return new Response('Unauthorized', { status: 403 });
    }

    const { fileId } = await req.json();
    if (!fileId) return new Response('Missing fileId', { status: 400 });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: file, error: fetchError } = await supabaseAdmin
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (fetchError || !file) throw new Error('File not found');

    const { data: signedUrl, error: signError } = await supabaseAdmin.storage
      .from('altera-resources')
      .createSignedUrl(file.storage_path, 3600);

    if (signError) throw signError;

    return new Response(JSON.stringify({ url: signedUrl.signedUrl }), {
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
