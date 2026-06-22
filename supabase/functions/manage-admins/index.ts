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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const token = authHeader.split(' ')[1]
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }
    const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(padded), c => c.charCodeAt(0))
      )
    )
    const email = payload?.email?.toLowerCase()?.trim()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    const { data: caller } = await supabaseAdmin
      .from('admin_users').select('id').eq('email', email).maybeSingle()

    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { action, targetEmail, displayName } = await req.json()

    if (action === 'list') {
      const { data: admins, error } = await supabaseAdmin
        .from('admin_users').select('*').order('created_at', { ascending: true })
      if (error) throw error
      return new Response(JSON.stringify(admins), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (action === 'add') {
      if (!targetEmail) {
        return new Response(JSON.stringify({ error: 'Missing targetEmail' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }
      const { error } = await supabaseAdmin
        .from('admin_users').insert({
          email: targetEmail.toLowerCase().trim(),
          display_name: displayName || targetEmail.split('@')[0],
          added_by: email,
        })
      if (error) {
        if (error.code === '23505') {
          return new Response(JSON.stringify({ error: 'Admin already exists' }), {
            status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }
        throw error
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (action === 'remove') {
      if (!targetEmail) {
        return new Response(JSON.stringify({ error: 'Missing targetEmail' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }
      const { error } = await supabaseAdmin
        .from('admin_users').delete().eq('email', targetEmail.toLowerCase().trim())
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: list, add, remove' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
