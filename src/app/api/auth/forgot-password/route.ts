import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendResetEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json())

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomUUID()
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await supabaseAdmin
      .from('users')
      .update({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date().toISOString() })
      .eq('id', user.id)

    await sendResetEmail(email, token)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
