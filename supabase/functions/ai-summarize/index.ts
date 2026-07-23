import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolvePDFJS } from 'https://esm.sh/pdfjs-serverless@0.4.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

class BadRequestError extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { fileId } = await req.json();
    if (!fileId) throw new BadRequestError('Missing fileId', 400);

    const { data: file, error: fileError } = await supabase
      .from('files').select('*').eq('id', fileId).single();
    if (fileError || !file) throw new BadRequestError('File not found', 404);

    const { data: signed } = await supabase.storage
      .from('altera-resources').createSignedUrl(file.storage_path, 300);

    const res = await fetch(signed.signedUrl);
    const buffer = await res.arrayBuffer();
    const fileType = (file.file_type || '').toLowerCase();

    let content: string;
    if (['pdf', 'application/pdf'].includes(fileType)) {
      try {
        const pdfjsLib = await resolvePDFJS();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        const pageTexts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
          if (pageText.trim()) pageTexts.push(pageText);
        }
        content = pageTexts.join('\n');
      } catch {
        throw new BadRequestError('No readable text found in PDF. The file may be scanned or image-based.', 422);
      }
    } else {
      content = new TextDecoder().decode(buffer);
    }

    if (!content.trim()) throw new BadRequestError('File content is empty', 422);

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
    const status = err.status || 500;
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
