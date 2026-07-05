import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('username, balanceBtc, balanceLtc, balanceDoge, xp, level, referralCode, createdAt')
    .eq('id', session.user.id)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { count: totalClaims } = await supabaseAdmin
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('userId', session.user.id)

  const { count: totalWithdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('*', { count: 'exact', head: true })
    .eq('userId', session.user.id)

  const { count: totalReferrals } = await supabaseAdmin
    .from('referral_earnings')
    .select('*', { count: 'exact', head: true })
    .eq('referrerId', session.user.id)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayClaims } = await supabaseAdmin
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('userId', session.user.id)
    .gte('claimedAt', today.toISOString())

  return NextResponse.json({
    user: {
      ...user,
      _count: {
        claims: totalClaims || 0,
        withdrawals: totalWithdrawals || 0,
        referralEarnings: totalReferrals || 0,
      },
    },
    todayClaims: todayClaims || 0,
  })
}
