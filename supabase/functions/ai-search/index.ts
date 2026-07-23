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

    const { query } = await req.json();
    if (!query || typeof query !== 'string') throw new Error('Missing query');

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
            content: `You are a search assistant for an academic file repository (CSMU). 
Extract structured search filters from this student query: "${query}"

Available courses: btech_cse_aiml, btech_cse_ds, btech_cse_cyber, btech_aids, btech_mech, btech_civil, btech_ece, btech_eee, bba, bca, mca, mba, mpharm, bpharm, dpharm, general
Available sections: notes, assignments, question_bank, lab_manuals, projects, reference_books, syllabi, timetables, exam_circulars

Return ONLY valid JSON with these optional fields:
- course: string (course id from list, or empty string)
- section: string (section id from list, or empty string)
- keywords: array of search terms extracted

Example: {"course":"btech_cse_aiml","section":"","keywords":["maths","3rd sem"]}`
          }]
        }),
      }
    );

    const zenData = await zenRes.json();
    if (!zenRes.ok) {
      const msg = zenData?.error?.message || `Zen API error: ${zenRes.status}`;
      throw new Error(msg);
    }
    const text = zenData?.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const filters = jsonMatch ? JSON.parse(jsonMatch[0]) : { keywords: [query] };

    if (!Array.isArray(filters.keywords)) {
      filters.keywords = [query];
    }

    // Query Supabase with extracted filters
    let dbQuery = supabase.from('files').select('*').eq('is_deployed', true);

    if (filters.section) dbQuery = dbQuery.eq('section', filters.section);
    if (filters.course) dbQuery = dbQuery.eq('course', filters.course);

    const searchTerms = filters.keywords?.filter(Boolean) || [];
    if (searchTerms.length > 0) {
      const orQueries = searchTerms.map(t => `name.ilike.%${encodeURIComponent(t)}%`).join(',');
      dbQuery = dbQuery.or(orQueries);
    }

    const { data: files } = await dbQuery.order('created_at', { ascending: false }).limit(20);

    return new Response(JSON.stringify({ files: files || [], filters }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, files: [] }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
