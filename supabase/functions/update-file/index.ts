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

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users').select('id').eq('email', email).maybeSingle()

    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { fileId, section, course, is_deployed } = await req.json()
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing fileId' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { data: file, error: fetchError } = await supabaseAdmin
      .from('files').select('name, section, is_deployed').eq('id', fileId).single()

    if (fetchError || !file) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const updates: Record<string, any> = {}
    const auditDetails: Record<string, any> = {}
    let auditAction = 'edit_meta'

    if (section !== undefined && section !== file.section) {
      updates.section = section
      auditDetails.oldSection = file.section
      auditDetails.newSection = section
    }

    if (is_deployed !== undefined && is_deployed !== file.is_deployed) {
      updates.is_deployed = is_deployed
      auditAction = is_deployed ? 'deploy' : 'undeploy'
    }

    if (course !== undefined && course !== file.course) {
      updates.course = course || null
      auditDetails.oldCourse = file.course
      auditDetails.newCourse = course
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No changes' }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    await supabaseAdmin.from('files').update(updates).eq('id', fileId)

    await supabaseAdmin.from('audit_logs').insert({
      action: auditAction, file_id: fileId, file_name: file.name,
      performed_by: email, details: auditDetails,
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
