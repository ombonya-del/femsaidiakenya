import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const ADMIN_EMAIL = 'cmt.kenya@gmail.com'

serve(async (req) => {
  console.log('Function triggered')
  console.log('RESEND_API_KEY present:', !!RESEND_API_KEY)

  try {
    const payload = await req.json()
    console.log('Payload received:', JSON.stringify(payload))

    const record = payload.record || payload
    console.log('Record county:', record.accused_county)

    const emailBody = `
New Red Flag submission — FemSaidia Kenya

Name / Alias:  ${record.accused_name || 'Not provided'}
County:        ${record.accused_county}
Platforms:     ${record.platforms || 'Not specified'}
Submitted:     ${new Date(record.created_at).toLocaleString('en-KE', {timeZone:'Africa/Nairobi'})}

MODE OF OPERATION
${record.modus_operandi}

SUBMITTER (confidential)
Email:  ${record.submitter_email}
Phone:  ${record.submitter_phone}
Name:   ${record.submitter_name || 'Anonymous'}

${record.photo_url ? 'Photo: ' + record.photo_url : 'No photo submitted'}
${record.social_link ? 'Social: ' + record.social_link : ''}
${record.additional_info ? 'Notes: ' + record.additional_info : ''}

Review: https://femsaidiakenya.org → Red Flag → Admin
FemSaidia Kenya · Built for justice
    `

    console.log('Sending email via Resend...')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FemSaidia Kenya <notifications@femsaidiakenya.org>',
        to: [ADMIN_EMAIL],
        subject: `New Red Flag submission — ${record.accused_county || 'Unknown'} — ${new Date().toLocaleDateString('en-KE')}`,
        text: emailBody,
      }),
    })

    const data = await res.json()
    console.log('Resend response status:', res.status)
    console.log('Resend response:', JSON.stringify(data))

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Function error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})