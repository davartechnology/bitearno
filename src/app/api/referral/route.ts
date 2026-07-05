import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('referralCode')
      .eq('id', session.user.id)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { count: totalReferrals } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('referredBy', session.user.id)

    const { data: earnings } = await supabaseAdmin
      .from('referral_earnings')
      .select('id, amount, currency, source, createdAt')
      .eq('referrerId', session.user.id)
      .order('createdAt', { ascending: false })
      .limit(20)

    const totalEarnings = (earnings || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0)

    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user.referralCode}`

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink,
      totalReferrals: totalReferrals || 0,
      totalEarnings,
      earnings: earnings || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
