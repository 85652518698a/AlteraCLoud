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

    const { data: file } = await supabase
      .from('files').select('name, section, course').eq('id', fileId).single();

    const ZEN_KEY = Deno.env.get('ZEN_API_KEY') || '';
    if (!ZEN_KEY) throw new Error('ZEN_API_KEY not configured');

    const response = await fetch(
      'https://opencode.ai/zen/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZEN_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-v4-flash-free',
          messages: [{
            role: 'user',
            content: `Suggest course and section for this academic file name: "${file?.name}"

Available courses: btech_cse_aiml, btech_cse_ds, btech_cse_cyber, btech_aids, btech_mech, btech_civil, btech_ece, btech_eee, bba, bca, mca, mba, mpharm, bpharm, dpharm, general
Available sections: notes, assignments, question_bank, lab_manuals, projects, reference_books, syllabi, timetables, exam_circulars

Return ONLY valid JSON: {"course":"course_id","section":"section_id","keywords":["keyword1","keyword2"]}
Current values: course="${file?.course || 'none'}", section="${file?.section || 'none'}"`
          }]
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || `Zen API error: ${response.status}`;
      throw new Error(msg);
    }
    const text = data?.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const suggestion = jsonMatch ? JSON.parse(jsonMatch[0]) : { course: '', section: '' };

    return new Response(JSON.stringify({
      fileName: file?.name,
      currentCourse: file?.course,
      currentSection: file?.section,
      suggestedCourse: suggestion.course || '',
      suggestedSection: suggestion.section || '',
      keywords: suggestion.keywords || [],
    }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
