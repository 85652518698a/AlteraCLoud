import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { fileId } = await req.json();
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing fileId' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify file exists
    const { data: file, error: fileError } = await supabase
      .from('files').select('id, name, is_deployed').eq('id', fileId).single();

    if (fileError || !file) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check existing token for this file that's still valid
    const { data: existing } = await supabase
      .from('share_links').select('token').eq('file_id', fileId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ token: existing.token }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate unique token
    let token: string;
    let retries = 3;
    do {
      token = generateToken();
      const { data: dup } = await supabase
        .from('share_links').select('id').eq('token', token).maybeSingle();
      if (!dup) break;
      retries--;
    } while (retries > 0);

    const { error: insertError } = await supabase
      .from('share_links').insert({ token, file_id: fileId });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ token }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
