import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, username, xp, level, balanceBtc, balanceLtc, balanceDoge, referralCode, createdAt, lastLoginAt')
      .eq('id', session.user.id)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { count: claimsCount } = await supabaseAdmin
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('userId', session.user.id)

    const { count: withdrawalsCount } = await supabaseAdmin
      .from('withdrawals')
      .select('*', { count: 'exact', head: true })
      .eq('userId', session.user.id)

    const { count: referralsCount } = await supabaseAdmin
      .from('referral_earnings')
      .select('*', { count: 'exact', head: true })
      .eq('referrerId', session.user.id)

    return NextResponse.json({
      user: {
        ...user,
        _count: {
          claims: claimsCount || 0,
          withdrawals: withdrawalsCount || 0,
          referralEarnings: referralsCount || 0,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

const updateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { username, currentPassword, newPassword } = updateSchema.parse(body)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updateData: any = { updatedAt: new Date().toISOString() }

    if (username && username !== user.username) {
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
      if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      updateData.username = username
    }

    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password || '')
      if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    await supabaseAdmin.from('users').update(updateData).eq('id', session.user.id)

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
