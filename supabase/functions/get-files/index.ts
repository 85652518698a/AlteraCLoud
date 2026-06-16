import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Missing token', { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      return new Response('Invalid token format', { status: 401 })
    }
    
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
      )
    )
    const email = payload?.email?.toLowerCase()?.trim()

    if (!email) {
      return new Response('Unauthorized', { status: 403 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Check if user is admin
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    const isAdmin = !!adminUser

    let query = supabaseAdmin.from('files').select('*')

    // Non-admins can only see deployed files
    if (!isAdmin) {
      query = query.eq('is_deployed', true)
    }

    const { data: files, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify(files), {
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
