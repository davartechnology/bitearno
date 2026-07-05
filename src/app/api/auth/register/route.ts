import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { generateReferralCode } from '@/lib/utils'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, username, password, referralCode } = registerSchema.parse(body)

    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    let referredBy = null
    if (referralCode) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referralCode', referralCode)
        .single()
      if (referrer) referredBy = referrer.id
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newReferralCode = generateReferralCode()
    const id = crypto.randomUUID()

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id,
        email,
        username,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy,
        isVerified: true,
        balanceBtc: 0,
        balanceLtc: 0,
        balanceDoge: 0,
        xp: 0,
        level: 1,
        isBanned: false,
        isSuspended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }

    await supabaseAdmin
      .from('daily_bonuses')
      .insert({ id: crypto.randomUUID(), userId: id, streak: 0 })

    return NextResponse.json({ success: true, message: 'Account created successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
