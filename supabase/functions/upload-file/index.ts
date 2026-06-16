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

    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const section = formData.get('section') as string
    const isDeployed = formData.get('isDeployed') === 'true'

    if (!file || !section) {
      return new Response(JSON.stringify({ error: 'Missing file or section' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const storagePath = `${section}/${crypto.randomUUID()}-${file.name}`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('altera-resources').upload(storagePath, file)

    if (uploadError) throw uploadError

    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files').insert({
        name: file.name, original_name: file.name, storage_path: storagePath,
        section, file_type: file.type.split('/')[0], mime_type: file.type,
        size_bytes: file.size, is_deployed: isDeployed, uploaded_by: email,
      }).select().single()

    if (dbError) throw dbError

    await supabaseAdmin.from('audit_logs').insert({
      action: 'upload', file_id: fileRecord.id, file_name: fileRecord.name,
      performed_by: email, details: { section, size: file.size },
    })

    return new Response(JSON.stringify(fileRecord), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
