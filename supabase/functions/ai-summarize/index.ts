import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { fileId } = await req.json();
    if (!fileId) throw new Error('Missing fileId');

    const { data: file, error: fileError } = await supabase
      .from('files').select('*').eq('id', fileId).single();
    if (fileError || !file) throw new Error('File not found');

    const { data: signed } = await supabase.storage
      .from('altera-resources').createSignedUrl(file.storage_path, 300);

    const res = await fetch(signed.signedUrl);
    const content = await res.text();
    const preview = content.slice(0, 30000);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Summarize this academic document in 3-5 bullet points (in English):\n\n${preview}`
            }]
          }]
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate summary';

    return new Response(JSON.stringify({ summary, fileName: file.name }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
