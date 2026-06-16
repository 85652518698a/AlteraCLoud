import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decode } from 'https://deno.land/x/jwt@v2.0.2/mod.ts'

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Missing token', { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const payload = decode(token)
    const email = payload?.email?.toLowerCase()?.trim()

    if (!email) {
      return new Response('Unauthorized', { status: 403 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Check admin status from DB
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (adminError || !adminUser) {
      return new Response('Unauthorized: Admin access required', { status: 403 })
    }

    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return new Response(JSON.stringify(logs), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
