import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let uid: string | null = null

    const authHeader = req.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1]
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
        const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), c => c.charCodeAt(0))))
        uid = payload.sub || payload.user_id || null
      } catch {}
    }

    const { fileId } = await req.json()
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'fileId required' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    if (uid) {
      const { data: adminUser } = await supabaseAdmin
        .from('admin_users').select('id').eq('email', uid).maybeSingle()
      const isAdmin = !!adminUser

      if (isAdmin) {
        const { data, error } = await supabaseAdmin
          .from('files').select('*').eq('id', fileId).maybeSingle()
        if (error) throw error
        if (!data) return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
        return new Response(JSON.stringify(data), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('files').select('*').eq('id', fileId).eq('is_deployed', true).maybeSingle()
    if (error) throw error
    if (!data) return new Response(JSON.stringify({ error: 'File not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

    return new Response(JSON.stringify(data), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
