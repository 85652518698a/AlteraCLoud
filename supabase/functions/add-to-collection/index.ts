import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil((token.split('.')[1]?.length || 0) / 4) * 4, '=')));
    const uid = payload.sub || payload.user_id;
    if (!uid) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const { collectionId, fileId } = await req.json();
    if (!collectionId || !fileId)
      return new Response(JSON.stringify({ error: 'collectionId and fileId required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: col } = await supabase.from('collections').select('created_by').eq('id', collectionId).single();
    if (!col || col.created_by !== uid)
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

    const { data, error } = await supabase.from('collection_files').insert({ collection_id: collectionId, file_id: fileId }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
