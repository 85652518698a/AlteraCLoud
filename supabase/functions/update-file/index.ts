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
      return new Response('Unauthorized: Invalid token', { status: 403 })
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

    const { fileId, section, is_deployed } = await req.json()
    if (!fileId) return new Response('Missing fileId', { status: 400 })

    // Fetch current file for audit logging
    const { data: file, error: fetchError } = await supabaseAdmin
      .from('files')
      .select('name, section, is_deployed')
      .eq('id', fileId)
      .single()

    if (fetchError || !file) throw new Error('File not found')

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

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No changes' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { error: updateError } = await supabaseAdmin
      .from('files')
      .update(updates)
      .eq('id', fileId)

    if (updateError) throw updateError

    await supabaseAdmin.from('audit_logs').insert({
      action: auditAction,
      file_id: fileId,
      file_name: file.name,
      performed_by: email,
      details: auditDetails,
    })

    return new Response(JSON.stringify({ success: true }), {
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
