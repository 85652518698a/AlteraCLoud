import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token') || (await req.json().catch(() => ({}))).token;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Look up token
    const { data: link, error: linkError } = await supabase
      .from('share_links').select('file_id, expires_at').eq('token', token).single();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'Invalid share link' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (new Date(link.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Share link has expired' }), {
        status: 410, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get file info
    const { data: file, error: fileError } = await supabase
      .from('files').select('*').eq('id', link.file_id').single();

    if (fileError || !file) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate signed URL
    const { data: signedUrl, error: signError } = await supabase.storage
      .from('altera-resources').createSignedUrl(file.storage_path, 3600);

    if (signError || !signedUrl) {
      return new Response(JSON.stringify({ error: 'Failed to generate download URL' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      file: {
        id: file.id,
        name: file.name,
        section: file.section,
        file_type: file.file_type,
        size_bytes: file.size_bytes,
        course: file.course,
      },
      url: signedUrl.signedUrl,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
