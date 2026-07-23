import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import pdfParse from 'https://esm.sh/pdf-parse@1.1.1';

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
    const buffer = await res.arrayBuffer();
    const fileType = (file.file_type || '').toLowerCase();

    let content: string;
    if (['pdf', 'application/pdf'].includes(fileType)) {
      try {
        const data = await pdfParse(new Uint8Array(buffer));
        content = data.text;
      } catch {
        throw new Error('Could not extract text from PDF. The file may be scanned or image-based.');
      }
    } else {
      content = new TextDecoder().decode(buffer);
    }

    if (!content.trim()) throw new Error('File content is empty');

    const preview = content.slice(0, 30000);

    const ZEN_KEY = Deno.env.get('ZEN_API_KEY') || '';
    if (!ZEN_KEY) throw new Error('ZEN_API_KEY not configured');

    const zenRes = await fetch(
      'https://opencode.ai/zen/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZEN_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-v4-flash-free',
          messages: [{
            role: 'user',
            content: `Summarize this academic document in 3-5 bullet points (in English):\n\n${preview}`
          }]
        }),
      }
    );

    const zenData = await zenRes.json();
    if (!zenRes.ok) {
      const msg = zenData?.error?.message || `Zen API error: ${zenRes.status}`;
      throw new Error(msg);
    }
    const summary = zenData?.choices?.[0]?.message?.content;
    if (!summary) throw new Error('Zen returned empty response');

    return new Response(JSON.stringify({ summary, fileName: file.name }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
